// Tipos principais usados pelo sistema.
// Mantemos tudo aqui para não repetir os mesmos formatos em outros arquivos.

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

// Campos extras que mudam conforme o tipo da requisição.
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

// Estrutura de uma requisição cadastrada.
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

// Guarda as informações necessárias para registrar e desfazer uma decisão.
export interface OperacaoHistorico {
  id: string;
  requisicaoId: string;
  acao: string;
  statusAnterior: StatusRequisicao;
  novoStatus: StatusRequisicao;
  dataHora: string;
  motivo?: string;
  requisicaoAnterior: Requisicao;
}
