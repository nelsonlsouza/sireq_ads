import { beforeEach, describe, expect, it } from 'vitest';
import { SireqService } from '../src/services/SireqService';

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

describe('SireqService', () => {
  beforeEach(() => storage.clear());

  it('gera IDs sequenciais e mantem FIFO', () => {
    const service = new SireqService();

    expect(service.cadastrar(novaRequisicao('A')).id).toBe('REQ-0001');
    expect(service.cadastrar(novaRequisicao('B')).id).toBe('REQ-0002');
    expect(service.cadastrar(novaRequisicao('C')).id).toBe('REQ-0003');
    expect(service.proxima()?.descricao).toBe('A');
  });

  it('remove somente a primeira requisicao ao iniciar analise', () => {
    const service = new SireqService();
    service.cadastrar(novaRequisicao('A'));
    service.cadastrar(novaRequisicao('B'));

    expect(service.iniciarAnalise().descricao).toBe('A');
    expect(service.proxima()?.descricao).toBe('B');
    expect(service.quantidade()).toBe(1);
  });

  it('registra uma aprovacao no historico', () => {
    const service = new SireqService();
    service.cadastrar(novaRequisicao('A'));
    service.iniciarAnalise();
    service.decidir('APROVADA');

    expect(service.ultimaOperacao()?.novoStatus).toBe('APROVADA');
    expect(service.historicoCompleto()).toHaveLength(1);
  });

  it('exige motivo para rejeicao', () => {
    const service = new SireqService();
    service.cadastrar(novaRequisicao('A'));
    service.iniciarAnalise();

    expect(() => service.decidir('REJEITADA')).toThrow('Informe o motivo.');
  });

  it('desfaz a ultima operacao e restaura a requisicao', () => {
    const service = new SireqService();
    service.cadastrar(novaRequisicao('A'));
    service.iniciarAnalise();
    service.decidir('APROVADA');
    service.desfazerUltima();

    expect(service.proxima()?.descricao).toBe('A');
    expect(service.historicoCompleto()).toHaveLength(0);
  });

  it('mantem os dados apos recriar o servico', () => {
    const service = new SireqService();
    service.cadastrar(novaRequisicao('Persistente'));

    const recarregado = new SireqService();
    expect(recarregado.proxima()?.descricao).toBe('Persistente');
  });

  it('trata operacoes invalidas sem quebrar', () => {
    const service = new SireqService();

    expect(() => service.iniciarAnalise()).toThrow(
      'Não há requisições pendentes.'
    );
    expect(() => service.desfazerUltima()).toThrow(
      'Não há operação para desfazer.'
    );
  });
});
