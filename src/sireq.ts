import { Armazenamento, CHAVES_STORAGE } from './armazenamento';
import { Fila } from './fila';
import { Pilha } from './pilha';
import type {
  OperacaoHistorico,
  Requisicao,
  StatusRequisicao
} from './tipos';
import { Validador } from './validador';

type NovaRequisicao = Omit<Requisicao, 'id' | 'status' | 'criadoEm'>;
type Decisao = Extract<
  StatusRequisicao,
  'APROVADA' | 'REJEITADA' | 'DEVOLVIDA'
>;

// Reúne as regras principais do sistema.
export class Sireq {
  private fila = new Fila<Requisicao>();
  private historico = new Pilha<OperacaoHistorico>();
  private emAnalise: Requisicao | null = null;

  constructor() {
    this.carregarDados();
  }

  cadastrar(dados: NovaRequisicao): Requisicao {
    const erros = Validador.validar(dados);

    if (erros.length > 0) {
      throw new Error(erros.join(' '));
    }

    const requisicao: Requisicao = {
      ...dados,
      id: this.gerarProximoId(),
      status: 'PENDENTE',
      criadoEm: new Date().toISOString()
    };

    // Toda nova requisição entra no final da fila.
    this.fila.enfileirar(requisicao);
    this.salvarDados();

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

    // A análise sempre começa pela primeira requisição da fila.
    const requisicao = this.fila.desenfileirar();

    if (!requisicao) {
      throw new Error('Não há requisições pendentes.');
    }

    requisicao.status = 'EM_ANALISE';
    this.emAnalise = requisicao;
    this.salvarDados();

    return requisicao;
  }

  decidir(status: Decisao, motivo = ''): void {
    if (!this.emAnalise) {
      throw new Error('Nenhuma requisição em análise.');
    }

    this.validarMotivo(status, motivo);

    // Salvamos uma cópia para conseguir desfazer a decisão depois.
    const antesDaDecisao = structuredClone(this.emAnalise);

    this.emAnalise.status = status;
    this.emAnalise.motivo = motivo || undefined;

    // A decisão mais recente fica no topo da pilha.
    this.historico.empilhar(
      this.criarOperacao(antesDaDecisao, status, motivo)
    );

    this.emAnalise = null;
    this.salvarDados();
  }

  cancelarProxima(motivo: string): void {
    if (!motivo.trim()) {
      throw new Error('Informe o motivo do cancelamento.');
    }

    const requisicao = this.fila.desenfileirar();

    if (!requisicao) {
      throw new Error('Não há requisição pendente.');
    }

    const antesDoCancelamento = structuredClone(requisicao);

    requisicao.status = 'CANCELADA';
    requisicao.motivo = motivo;

    this.historico.empilhar(
      this.criarOperacao(antesDoCancelamento, 'CANCELADA', motivo)
    );

    this.salvarDados();
  }

  desfazerUltima(): void {
    if (this.emAnalise) {
      throw new Error('Finalize a análise atual antes de desfazer.');
    }

    // A pilha devolve primeiro a operação mais recente.
    const ultimaOperacao = this.historico.desempilhar();

    if (!ultimaOperacao) {
      throw new Error('Não há operação para desfazer.');
    }

    const requisicaoRestaurada: Requisicao = {
      ...ultimaOperacao.requisicaoAnterior,
      status: 'PENDENTE',
      motivo: undefined
    };

    this.fila.inserirNoInicio(requisicaoRestaurada);
    this.salvarDados();
  }

  limpar(): void {
    this.fila.carregar([]);
    this.historico.carregar([]);
    this.emAnalise = null;
    Armazenamento.limpar();
  }

  private validarMotivo(status: Decisao, motivo: string): void {
    const precisaDeMotivo =
      status === 'REJEITADA' || status === 'DEVOLVIDA';

    if (precisaDeMotivo && !motivo.trim()) {
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

  private gerarProximoId(): string {
    const idsExistentes = [
      ...this.fila.listar().map((requisicao) => requisicao.id),
      ...this.historico.listar().map((operacao) => operacao.requisicaoId),
      ...(this.emAnalise ? [this.emAnalise.id] : [])
    ];

    const maiorNumero = idsExistentes.reduce((maior, id) => {
      const numero = Number(id.replace('REQ-', ''));
      return Number.isFinite(numero) ? Math.max(maior, numero) : maior;
    }, 0);

    return `REQ-${String(maiorNumero + 1).padStart(4, '0')}`;
  }

  private salvarDados(): void {
    Armazenamento.salvar(CHAVES_STORAGE.fila, this.fila.listar());

    Armazenamento.salvar(
      CHAVES_STORAGE.historico,
      this.historico.listarOrdemInterna()
    );

    Armazenamento.salvar(CHAVES_STORAGE.emAnalise, this.emAnalise);
  }

  private carregarDados(): void {
    this.fila.carregar(
      Armazenamento.carregar<Requisicao[]>(CHAVES_STORAGE.fila, [])
    );

    this.historico.carregar(
      Armazenamento.carregar<OperacaoHistorico[]>(
        CHAVES_STORAGE.historico,
        []
      )
    );

    this.emAnalise = Armazenamento.carregar<Requisicao | null>(
      CHAVES_STORAGE.emAnalise,
      null
    );
  }
}
