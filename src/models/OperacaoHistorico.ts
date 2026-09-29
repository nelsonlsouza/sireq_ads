import type { Requisicao, StatusRequisicao } from './Requisicao';

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
