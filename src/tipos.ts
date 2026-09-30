// Tipos usados em todo o sistema.
// Este arquivo existe para manter os formatos dos dados em um único lugar.

export type TipoRequisicao =
  | 'MATERIAL'
  | 'SERVICO'
  | 'VIAGEM'
  | 'SOFTWARE'
  | 'OUTROS';

export type StatusRequisicao =
  | 'PENDENTE'
  | 'EM_ANALISE'
  | 'APROVADA'
  | 'REJEITADA'
  | 'DEVOLVIDA'
  | 'CANCELADA';

export interface DadosEspecificos {
  item?: string;
  quantidade?: number;
  valorUnitario?: number;
  fornecedor?: string;
  periodo?: string;
  destino?: string;
  finalidade?: string;
  software?: string;
  licencas?: number;
  descricaoDetalhada?: string;
}

export interface Requisicao {
  id: string;
  setor: string;
  requisitante: string;
  tipo: TipoRequisicao;
  descricao: string;
  justificativa: string;
  valor: number;
  dadosEspecificos: DadosEspecificos;
  status: StatusRequisicao;
  criadoEm: string;
  motivo?: string;
}

export interface OperacaoHistorico {
  id: string;
  requisicaoId: string;
  acao: string;
  statusAnterior: StatusRequisicao;
  novoStatus: StatusRequisicao;
  dataHora: string;
  motivo?: string;

  // Guarda uma cópia da requisição antes da decisão.
  // Essa cópia é usada quando a última operação precisa ser desfeita.
  requisicaoAnterior: Requisicao;
}
