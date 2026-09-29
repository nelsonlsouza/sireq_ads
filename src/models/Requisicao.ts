export type TipoRequisicao = 'MATERIAL' | 'SERVICO' | 'VIAGEM' | 'SOFTWARE' | 'OUTROS';
export type StatusRequisicao = 'PENDENTE' | 'EM_ANALISE' | 'APROVADA' | 'REJEITADA' | 'DEVOLVIDA' | 'CANCELADA';

export interface Requisicao {
  id: string;
  setor: string;
  requisitante: string;
  tipo: TipoRequisicao;
  descricao: string;
  justificativa: string;
  valor: number;
  status: StatusRequisicao;
  criadoEm: string;
  motivo?: string;
}