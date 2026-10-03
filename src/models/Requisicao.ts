export type TipoRequisicao = 'MATERIAL' | 'SERVICO' | 'VIAGEM' | 'SOFTWARE' | 'OUTROS';
export type StatusRequisicao =
  'PENDENTE' | 'EM_ANALISE' | 'APROVADA' | 'REJEITADA' | 'DEVOLVIDA' | 'CANCELADA';

export interface DadosEspecificos {
  item?: string;
  unidade?: string;
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
