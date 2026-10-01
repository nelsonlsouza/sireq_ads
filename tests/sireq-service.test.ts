import { beforeEach, describe, expect, it } from 'vitest';
import { Sireq } from '../src/sireq';

class LocalStorageFake {
  private dados = new Map<string, string>();

  getItem(chave: string): string | null {
    return this.dados.get(chave) ?? null;
  }

  setItem(chave: string, valor: string): void {
    this.dados.set(chave, valor);
  }

  removeItem(chave: string): void {
    this.dados.delete(chave);
  }

  clear(): void {
    this.dados.clear();
  }
}

const storage = new LocalStorageFake();
Object.defineProperty(globalThis, 'localStorage', { value: storage });

const novaRequisicao = (descricao: string) => ({
  setor: 'TI',
  requisitante: 'Usuario Teste',
  tipo: 'MATERIAL' as const,
  descricao,
  justificativa: 'Justificativa valida com mais de vinte caracteres.',
  valor: 100,
  dadosEspecificos: {
    item: 'Item',
    quantidade: 1,
    valorUnitario: 100
  }
});

describe('Sireq', () => {
  beforeEach(() => storage.clear());

  it('gera IDs sequenciais e mantem FIFO', () => {
    const sireq = new Sireq();

    expect(sireq.cadastrar(novaRequisicao('A')).id).toBe('REQ-0001');
    expect(sireq.cadastrar(novaRequisicao('B')).id).toBe('REQ-0002');
    expect(sireq.cadastrar(novaRequisicao('C')).id).toBe('REQ-0003');
    expect(sireq.proxima()?.descricao).toBe('A');
  });

  it('remove somente a primeira requisicao ao iniciar analise', () => {
    const sireq = new Sireq();

    sireq.cadastrar(novaRequisicao('A'));
    sireq.cadastrar(novaRequisicao('B'));

    expect(sireq.iniciarAnalise().descricao).toBe('A');
    expect(sireq.proxima()?.descricao).toBe('B');
    expect(sireq.quantidade()).toBe(1);
  });

  it('registra uma aprovacao no historico', () => {
    const sireq = new Sireq();

    sireq.cadastrar(novaRequisicao('A'));
    sireq.iniciarAnalise();
    sireq.decidir('APROVADA');

    expect(sireq.ultimaOperacao()?.novoStatus).toBe('APROVADA');
    expect(sireq.historicoCompleto()).toHaveLength(1);
  });

  it('exige motivo para rejeicao', () => {
    const sireq = new Sireq();

    sireq.cadastrar(novaRequisicao('A'));
    sireq.iniciarAnalise();

    expect(() => sireq.decidir('REJEITADA')).toThrow('Informe o motivo.');
  });

  it('desfaz a ultima operacao e restaura a requisicao', () => {
    const sireq = new Sireq();

    sireq.cadastrar(novaRequisicao('A'));
    sireq.iniciarAnalise();
    sireq.decidir('APROVADA');
    sireq.desfazerUltima();

    expect(sireq.proxima()?.descricao).toBe('A');
    expect(sireq.historicoCompleto()).toHaveLength(0);
  });

  it('mantem os dados apos recriar o sistema', () => {
    const sireq = new Sireq();
    sireq.cadastrar(novaRequisicao('Persistente'));

    const recarregado = new Sireq();

    expect(recarregado.proxima()?.descricao).toBe('Persistente');
  });

  it('reenvia uma requisicao devolvida para o final da fila', () => {
    const sireq = new Sireq();

    const original = sireq.cadastrar(novaRequisicao('A'));
    sireq.cadastrar(novaRequisicao('B'));

    sireq.iniciarAnalise();
    sireq.decidir('DEVOLVIDA', 'Corrigir descrição');

    const corrigida = sireq.reenviar(original.id, {
      ...novaRequisicao('A corrigida'),
      valor: 150
    });

    expect(corrigida.id).toBe(original.id);
    expect(corrigida.criadoEm).toBe(original.criadoEm);
    expect(corrigida.status).toBe('PENDENTE');
    expect(sireq.pendentes().map((r) => r.descricao)).toEqual([
      'B',
      'A corrigida'
    ]);
  });

  it('nao permite reenviar uma requisicao que nao foi devolvida', () => {
    const sireq = new Sireq();
    const original = sireq.cadastrar(novaRequisicao('A'));

    expect(() =>
      sireq.reenviar(original.id, novaRequisicao('A corrigida'))
    ).toThrow('Esta requisição não está disponível para reenvio.');
  });

  it('trata operacoes invalidas sem quebrar', () => {
    const sireq = new Sireq();

    expect(() => sireq.iniciarAnalise()).toThrow(
      'Não há requisições pendentes.'
    );

    expect(() => sireq.desfazerUltima()).toThrow(
      'Não há operação para desfazer.'
    );
  });
});
