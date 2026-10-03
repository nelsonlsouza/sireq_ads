import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SireqService } from '../src/services/SireqService';
import { ValidadorService } from '../src/services/ValidadorService';
import type { Requisicao } from '../src/models/Requisicao';

const dados = (descricao = 'A'): Omit<Requisicao, 'id' | 'status' | 'criadoEm'> => ({
  setor: 'TI',
  requisitante: 'Ana',
  tipo: 'MATERIAL',
  descricao,
  justificativa: 'Necessidade operacional comprovada',
  valor: 10,
  dadosEspecificos: { item: 'Papel', quantidade: 1, unidade: 'caixa', valorUnitario: 10 },
});

beforeEach(() => {
  const itens = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => itens.get(k) ?? null,
    setItem: (k: string, v: string) => {
      itens.set(k, v);
    },
    removeItem: (k: string) => {
      itens.delete(k);
    },
  });
});

describe('validação e fluxo SIREQ', () => {
  it('mantém Software de R$ 50.000 após requisições anteriores na fila FIFO', () => {
    const s = new SireqService();
    const material = s.cadastrar(dados('Material anterior'));
    const software = s.cadastrar({
      ...dados('Licenças corporativas'),
      tipo: 'SOFTWARE',
      valor: 50000,
      dadosEspecificos: { software: 'Editor', licencas: 25, periodo: '12 meses' },
    });
    expect(s.pendentes().map((r) => r.id)).toEqual([material.id, software.id]);
    expect(s.proxima()?.id).toBe(material.id);
    expect(s.quantidade()).toBe(2);
    s.iniciarAnalise();
    expect(s.proxima()?.id).toBe(software.id);
    expect(s.buscarPorId(software.id)?.dadosEspecificos.licencas).toBe(25);
  });
  it.each([
    [{ software: '', licencas: 2, periodo: '12 meses' }, 'nome do software'],
    [{ software: 'Editor', licencas: 0, periodo: '12 meses' }, 'quantidade de licenças'],
    [{ software: 'Editor', licencas: 1.5, periodo: '12 meses' }, 'quantidade de licenças'],
    [{ software: 'Editor', licencas: 2, periodo: '' }, 'período da licença'],
  ])('rejeita Software inválido sem alterar fila nem histórico: %j', (especificos, erro) => {
    const s = new SireqService();
    const entrada = { ...dados('Licença'), tipo: 'SOFTWARE' as const, dadosEspecificos: especificos };
    expect(() => s.cadastrar(entrada)).toThrow(erro);
    expect(s.quantidade()).toBe(0);
    expect(s.historicoCompleto()).toEqual([]);
  });
  it('revalida Software devolvido antes do reenvio e preserva ID e ordem', () => {
    const s = new SireqService();
    const entrada = { ...dados('Licença'), tipo: 'SOFTWARE' as const,
      dadosEspecificos: { software: 'Editor', licencas: 2, periodo: '12 meses' } };
    const original = s.cadastrar(entrada);
    s.iniciarAnalise();
    s.decidir('DEVOLVIDA', 'Corrigir licenças');
    const seguinte = s.cadastrar(dados('Material seguinte'));
    expect(() => s.corrigirEReenviar(original.id, { ...entrada,
      dadosEspecificos: { ...entrada.dadosEspecificos, licencas: 0 } })).toThrow('licenças');
    expect(s.devolvidas().map((r) => r.id)).toEqual([original.id]);
    const corrigida = s.corrigirEReenviar(original.id, { ...entrada,
      dadosEspecificos: { ...entrada.dadosEspecificos, licencas: 3 } });
    expect(corrigida.id).toBe(original.id);
    expect(corrigida.criadoEm).toBe(original.criadoEm);
    expect(s.pendentes().map((r) => r.id)).toEqual([seguinte.id, original.id]);
  });
  it.each([
    ['SERVICO', { fornecedor: 'Empresa', periodo: '12 meses' }, 'fornecedor'],
    ['VIAGEM', { destino: 'Manaus', periodo: '2 dias', finalidade: 'Treinamento' }, 'destino'],
    ['SOFTWARE', { software: 'Editor', licencas: 2, periodo: '12 meses' }, 'software'],
    ['OUTROS', { descricaoDetalhada: 'Despesa operacional' }, 'descricaoDetalhada'],
  ] as const)('valida campos específicos de %s', (tipo, especificos, obrigatorio) => {
    const s = new SireqService();
    const entrada = { ...dados(tipo), tipo, dadosEspecificos: especificos };
    s.cadastrar(entrada);
    expect(s.quantidade()).toBe(1);
    const incompleta = { ...entrada, dadosEspecificos: { ...especificos, [obrigatorio]: '' } };
    expect(ValidadorService.validar(incompleta).length).toBeGreaterThan(0);
  });
  it('impede entrada inválida e valida unidade e quantidade inteira', () => {
    const s = new SireqService();
    const invalida = dados();
    invalida.dadosEspecificos.unidade = '';
    expect(() => s.cadastrar(invalida)).toThrow('unidade');
    expect(s.quantidade()).toBe(0);
    invalida.dadosEspecificos.unidade = 'caixa';
    invalida.dadosEspecificos.quantidade = 1.5;
    expect(ValidadorService.validar(invalida)).toContain('Informe uma quantidade válida.');
  });
  it('rejeita tipo desconhecido sem alterar a fila', () => {
    const s = new SireqService();
    const invalida = { ...dados(), tipo: 'DESCONHECIDO' as Requisicao['tipo'] };
    expect(() => s.cadastrar(invalida)).toThrow('Tipo de requisição inválido');
    expect(s.quantidade()).toBe(0);
  });
  it('preserva FIFO, registra decisão e restaura pelo topo LIFO', () => {
    const s = new SireqService();
    const a = s.cadastrar(dados('A'));
    const b = s.cadastrar(dados('B'));
    expect(s.proxima()?.id).toBe(a.id);
    expect(s.quantidade()).toBe(2);
    s.iniciarAnalise();
    s.decidir('APROVADA');
    expect(s.proxima()?.id).toBe(b.id);
    s.iniciarAnalise();
    s.decidir('REJEITADA', 'Duplicada');
    expect(s.ultimaOperacao()?.requisicaoId).toBe(b.id);
    s.desfazerUltima();
    expect(s.proxima()?.id).toBe(b.id);
    s.desfazerUltima();
    expect(s.pendentes().map((r) => r.id)).toEqual([a.id, b.id]);
  });
  it('não altera histórico quando desfazer está bloqueado', () => {
    const s = new SireqService();
    s.cadastrar(dados());
    s.iniciarAnalise();
    s.decidir('APROVADA');
    const topo = s.ultimaOperacao()?.id;
    s.cadastrar(dados('B'));
    s.iniciarAnalise();
    expect(() => s.desfazerUltima()).toThrow('Finalize');
    expect(s.ultimaOperacao()?.id).toBe(topo);
  });
  it('corrige devolvida e reenvia no final após nova validação', () => {
    const s = new SireqService();
    const a = s.cadastrar(dados('A'));
    s.iniciarAnalise();
    s.decidir('DEVOLVIDA', 'Corrigir item');
    const b = s.cadastrar(dados('B'));
    expect(s.devolvidas().map((r) => r.id)).toEqual([a.id]);
    const corrigida = dados('A corrigida');
    corrigida.justificativa = 'curta';
    expect(() => s.corrigirEReenviar(a.id, corrigida)).toThrow();
    expect(s.quantidade()).toBe(1);
    corrigida.justificativa = 'Justificativa corrigida e completa';
    s.corrigirEReenviar(a.id, corrigida);
    expect(s.pendentes().map((r) => r.id)).toEqual([b.id, a.id]);
    expect(s.devolvidas()).toEqual([]);
  });
  it('preserva estado após recarga, busca ID e não reutiliza ID desfeito', () => {
    const s = new SireqService();
    const a = s.cadastrar(dados());
    s.iniciarAnalise();
    s.decidir('APROVADA');
    s.desfazerUltima();
    const b = s.cadastrar(dados('B'));
    expect(b.id).not.toBe(a.id);
    const recarregado = new SireqService();
    expect(recarregado.pendentes().map((r) => r.id)).toEqual([a.id, b.id]);
    expect(recarregado.buscarPorId(b.id)?.descricao).toBe('B');
  });
  it('exige motivo e trata estruturas vazias', () => {
    const s = new SireqService();
    expect(() => s.iniciarAnalise()).toThrow();
    expect(() => s.desfazerUltima()).toThrow();
    s.cadastrar(dados());
    s.iniciarAnalise();
    expect(() => s.decidir('REJEITADA')).toThrow('motivo');
    expect(s.atual()).not.toBeNull();
  });
  it('cancela somente a próxima com motivo e mantém a seguinte', () => {
    const s = new SireqService();
    const a = s.cadastrar(dados('A'));
    const b = s.cadastrar(dados('B'));
    expect(() => s.cancelarProxima('')).toThrow('motivo');
    expect(s.quantidade()).toBe(2);
    s.cancelarProxima('Solicitação duplicada');
    expect(s.proxima()?.id).toBe(b.id);
    expect(s.ultimaOperacao()?.requisicaoId).toBe(a.id);
    expect(s.buscarPorId(a.id)?.status).toBe('CANCELADA');
  });
  it('não duplica requisição ao desfazer decisão anterior após reenvio', () => {
    const s = new SireqService();
    const a = s.cadastrar(dados('A'));
    s.iniciarAnalise();
    s.decidir('DEVOLVIDA', 'Corrigir');
    s.corrigirEReenviar(a.id, dados('A corrigida'));
    expect(() => s.desfazerUltima()).toThrow('já está pendente');
    expect(s.pendentes().map((req) => req.id)).toEqual([a.id]);
    expect(s.ultimaOperacao()?.acao).toBe('DEVOLVIDA');
  });
});
