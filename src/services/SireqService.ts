import { Fila } from '../structures/Fila';
import { Pilha } from '../structures/Pilha';
import type { Requisicao, StatusRequisicao } from '../models/Requisicao';
import type { OperacaoHistorico } from '../models/OperacaoHistorico';
import { StorageService } from './StorageService';
import { ValidadorService } from './ValidadorService';

type NovaRequisicao = Omit<Requisicao, 'id' | 'status' | 'criadoEm'>;

export class SireqService {
  private fila = new Fila<Requisicao>();
  private historico = new Pilha<OperacaoHistorico>();
  private emAnalise: Requisicao | null = null;

  constructor() {
    this.carregar();
  }

  cadastrar(dados: NovaRequisicao): Requisicao {
    const erros = ValidadorService.validar(dados);
    if (erros.length) throw new Error(erros.join(' '));
    const requisicao: Requisicao = {
      ...dados,
      id: this.proximoId(),
      status: 'PENDENTE',
      criadoEm: new Date().toISOString(),
    };
    this.fila.enfileirar(requisicao);
    this.salvar();
    return requisicao;
  }

  proxima(): Requisicao | undefined {
    return this.fila.frente();
  }
  pendentes(): Requisicao[] {
    return this.fila.listar();
  }
  quantidade(): number {
    return this.fila.quantidade();
  }
  atual(): Requisicao | null {
    return this.emAnalise;
  }
  historicoCompleto(): OperacaoHistorico[] {
    return this.historico.listar();
  }
  ultimaOperacao(): OperacaoHistorico | undefined {
    return this.historico.consultarTopo();
  }
  devolvidas(): Requisicao[] {
    const ultimas = new Map<string, OperacaoHistorico>();
    for (const op of this.historico.listar())
      if (!ultimas.has(op.requisicaoId)) ultimas.set(op.requisicaoId, op);
    const ativos = new Set(this.fila.listar().map((r) => r.id));
    if (this.emAnalise) ativos.add(this.emAnalise.id);
    return [...ultimas.values()]
      .filter((op) => op.acao === 'DEVOLVIDA' && !ativos.has(op.requisicaoId))
      .map((op) => ({ ...op.requisicaoAnterior, status: 'DEVOLVIDA', motivo: op.motivo }));
  }
  buscarPorId(id: string): Requisicao | undefined {
    const operacao = this.historico.listar().find((item) => item.requisicaoId === id);
    return (
      this.fila.listar().find((r) => r.id === id) ??
      (this.emAnalise?.id === id ? this.emAnalise : undefined) ??
      this.devolvidas().find((r) => r.id === id) ??
      (operacao
        ? { ...operacao.requisicaoAnterior, status: operacao.novoStatus, motivo: operacao.motivo }
        : undefined)
    );
  }
  corrigirEReenviar(id: string, dados: NovaRequisicao): Requisicao {
    const op = this.historico.listar().find((item) => item.requisicaoId === id);
    if (
      !op ||
      op.acao !== 'DEVOLVIDA' ||
      this.fila.listar().some((r) => r.id === id) ||
      this.emAnalise?.id === id
    )
      throw new Error('Requisição não está devolvida para correção.');
    const erros = ValidadorService.validar(dados);
    if (erros.length) throw new Error(erros.join(' '));
    const req: Requisicao = {
      ...dados,
      id,
      criadoEm: op.requisicaoAnterior.criadoEm,
      status: 'PENDENTE',
    };
    this.fila.enfileirar(req);
    this.salvar();
    return req;
  }

  iniciarAnalise(): Requisicao {
    if (this.emAnalise) return this.emAnalise;
    const req = this.fila.desenfileirar();
    if (!req) throw new Error('Não há requisições pendentes.');
    req.status = 'EM_ANALISE';
    this.emAnalise = req;
    this.salvar();
    return req;
  }

  decidir(
    status: Extract<StatusRequisicao, 'APROVADA' | 'REJEITADA' | 'DEVOLVIDA'>,
    motivo = '',
  ): void {
    if (!this.emAnalise) throw new Error('Nenhuma requisição em análise.');
    if ((status === 'REJEITADA' || status === 'DEVOLVIDA') && !motivo.trim())
      throw new Error('Informe o motivo.');
    const anterior = structuredClone(this.emAnalise);
    const operacao: OperacaoHistorico = {
      id: crypto.randomUUID(),
      requisicaoId: anterior.id,
      acao: status,
      statusAnterior: anterior.status,
      novoStatus: status,
      dataHora: new Date().toISOString(),
      motivo,
      requisicaoAnterior: anterior,
    };
    this.emAnalise.status = status;
    this.emAnalise.motivo = motivo || undefined;
    this.historico.empilhar(operacao);
    this.emAnalise = null;
    this.salvar();
  }

  cancelarProxima(motivo: string): void {
    if (!motivo.trim()) throw new Error('Informe o motivo do cancelamento.');
    const req = this.fila.desenfileirar();
    if (!req) throw new Error('Não há requisição pendente.');
    const anterior = structuredClone(req);
    req.status = 'CANCELADA';
    req.motivo = motivo;
    this.historico.empilhar({
      id: crypto.randomUUID(),
      requisicaoId: req.id,
      acao: 'CANCELADA',
      statusAnterior: anterior.status,
      novoStatus: 'CANCELADA',
      dataHora: new Date().toISOString(),
      motivo,
      requisicaoAnterior: anterior,
    });
    this.salvar();
  }

  desfazerUltima(): void {
    const op = this.historico.consultarTopo();
    if (!op) throw new Error('Não há operação para desfazer.');
    if (this.emAnalise) throw new Error('Finalize a análise atual antes de desfazer.');
    if (this.fila.listar().some((req) => req.id === op.requisicaoId)) {
      throw new Error('A requisição já está pendente; não é possível desfazer esta operação.');
    }
    this.historico.desempilhar();
    this.fila.inserirNoInicio({ ...op.requisicaoAnterior, status: 'PENDENTE', motivo: undefined });
    this.salvar();
  }

  limpar(): void {
    this.fila.carregar([]);
    this.historico.carregar([]);
    this.emAnalise = null;
    StorageService.limpar();
  }

  private proximoId(): string {
    const ids = [
      ...this.fila.listar().map((r) => r.id),
      ...this.historico.listar().map((h) => h.requisicaoId),
      ...(this.emAnalise ? [this.emAnalise.id] : []),
    ];
    const maior = ids.reduce((max, id) => {
      const numero = Number(id.replace('REQ-', ''));
      return Number.isFinite(numero) ? Math.max(max, numero) : max;
    }, 0);
    const ultimo = StorageService.carregar<number>('sireq_ultimo_id', 0);
    const proximo = Math.max(maior, ultimo) + 1;
    StorageService.salvar('sireq_ultimo_id', proximo);
    return `REQ-${String(proximo).padStart(4, '0')}`;
  }

  private salvar(): void {
    StorageService.salvar('sireq_fila', this.fila.listar());
    StorageService.salvar('sireq_historico', this.historico.listarOrdemInterna());
    StorageService.salvar('sireq_em_analise', this.emAnalise);
  }
  private carregar(): void {
    this.fila.carregar(StorageService.carregar<Requisicao[]>('sireq_fila', []));
    this.historico.carregar(StorageService.carregar<OperacaoHistorico[]>('sireq_historico', []));
    this.emAnalise = StorageService.carregar<Requisicao | null>('sireq_em_analise', null);
  }
}
