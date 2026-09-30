import { Fila } from '../structures/Fila';
import { Pilha } from '../structures/Pilha';
import type { Requisicao, StatusRequisicao } from '../models/Requisicao';
import type { OperacaoHistorico } from '../models/OperacaoHistorico';
import { StorageService } from './StorageService';
import { ValidadorService } from './ValidadorService';

type NovaRequisicao = Omit<Requisicao, 'id' | 'status' | 'criadoEm'>;
type Decisao = Extract<StatusRequisicao, 'APROVADA' | 'REJEITADA' | 'DEVOLVIDA'>;

const STORAGE = {
  fila: 'sireq_fila',
  historico: 'sireq_historico',
  emAnalise: 'sireq_em_analise'
} as const;

/**
 * Centraliza as regras de negócio do SIREQ.
 * A interface chama este serviço; o serviço decide como Fila, Pilha e persistência serão usadas.
 */
export class SireqService {
  private fila = new Fila<Requisicao>();
  private historico = new Pilha<OperacaoHistorico>();
  private emAnalise: Requisicao | null = null;

  constructor() {
    this.carregar();
  }

  cadastrar(dados: NovaRequisicao): Requisicao {
    const erros = ValidadorService.validar(dados);

    if (erros.length > 0) {
      throw new Error(erros.join(' '));
    }

    const requisicao: Requisicao = {
      ...dados,
      id: this.proximoId(),
      status: 'PENDENTE',
      criadoEm: new Date().toISOString()
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

  iniciarAnalise(): Requisicao {
    if (this.emAnalise) {
      return this.emAnalise;
    }

    // desenfileirar() garante que somente o primeiro elemento da FIFO avance.
    const requisicao = this.fila.desenfileirar();

    if (!requisicao) {
      throw new Error('Não há requisições pendentes.');
    }

    requisicao.status = 'EM_ANALISE';
    this.emAnalise = requisicao;
    this.salvar();

    return requisicao;
  }

  decidir(status: Decisao, motivo = ''): void {
    if (!this.emAnalise) {
      throw new Error('Nenhuma requisição em análise.');
    }

    this.validarMotivoDaDecisao(status, motivo);

    const anterior = structuredClone(this.emAnalise);
    const operacao = this.criarOperacao(anterior, status, motivo);

    this.emAnalise.status = status;
    this.emAnalise.motivo = motivo || undefined;

    // A última decisão fica no topo da pilha para permitir LIFO/desfazer.
    this.historico.empilhar(operacao);
    this.emAnalise = null;
    this.salvar();
  }

  cancelarProxima(motivo: string): void {
    if (!motivo.trim()) {
      throw new Error('Informe o motivo do cancelamento.');
    }

    const requisicao = this.fila.desenfileirar();

    if (!requisicao) {
      throw new Error('Não há requisição pendente.');
    }

    const anterior = structuredClone(requisicao);
    requisicao.status = 'CANCELADA';
    requisicao.motivo = motivo;

    this.historico.empilhar(
      this.criarOperacao(anterior, 'CANCELADA', motivo)
    );

    this.salvar();
  }

  desfazerUltima(): void {
    if (this.emAnalise) {
      throw new Error('Finalize a análise atual antes de desfazer.');
    }

    // desempilhar() remove exatamente a operação mais recente (LIFO).
    const operacao = this.historico.desempilhar();

    if (!operacao) {
      throw new Error('Não há operação para desfazer.');
    }

    const restaurada: Requisicao = {
      ...operacao.requisicaoAnterior,
      status: 'PENDENTE',
      motivo: undefined
    };

    this.fila.inserirNoInicio(restaurada);
    this.salvar();
  }

  limpar(): void {
    this.fila.carregar([]);
    this.historico.carregar([]);
    this.emAnalise = null;
    StorageService.limpar();
  }

  private validarMotivoDaDecisao(status: Decisao, motivo: string): void {
    const exigeMotivo = status === 'REJEITADA' || status === 'DEVOLVIDA';

    if (exigeMotivo && !motivo.trim()) {
      throw new Error('Informe o motivo.');
    }
  }

  private criarOperacao(
    requisicaoAnterior: Requisicao,
    novoStatus: StatusRequisicao,
    motivo: string
  ): OperacaoHistorico {
    return {
      id: crypto.randomUUID(),
      requisicaoId: requisicaoAnterior.id,
      acao: novoStatus,
      statusAnterior: requisicaoAnterior.status,
      novoStatus,
      dataHora: new Date().toISOString(),
      motivo,
      requisicaoAnterior
    };
  }

  private proximoId(): string {
    const ids = [
      ...this.fila.listar().map((requisicao) => requisicao.id),
      ...this.historico.listar().map((operacao) => operacao.requisicaoId),
      ...(this.emAnalise ? [this.emAnalise.id] : [])
    ];

    const maiorId = ids.reduce((maior, id) => {
      const numero = Number(id.replace('REQ-', ''));
      return Number.isFinite(numero) ? Math.max(maior, numero) : maior;
    }, 0);

    return `REQ-${String(maiorId + 1).padStart(4, '0')}`;
  }

  private salvar(): void {
    StorageService.salvar(STORAGE.fila, this.fila.listar());
    StorageService.salvar(
      STORAGE.historico,
      this.historico.listarOrdemInterna()
    );
    StorageService.salvar(STORAGE.emAnalise, this.emAnalise);
  }

  private carregar(): void {
    this.fila.carregar(
      StorageService.carregar<Requisicao[]>(STORAGE.fila, [])
    );

    this.historico.carregar(
      StorageService.carregar<OperacaoHistorico[]>(STORAGE.historico, [])
    );

    this.emAnalise = StorageService.carregar<Requisicao | null>(
      STORAGE.emAnalise,
      null
    );
  }
}
