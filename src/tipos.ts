/*
 * TIPOS DO SISTEMA
 *
 * Este arquivo não possui regra de negócio.
 * Ele apenas descreve o formato dos dados que circulam no SIREQ.
 *
 * Pense nele como um "contrato":
 * toda requisição precisa seguir o formato definido aqui.
 */

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

/*
 * Alguns campos existem apenas para determinados tipos.
 * Por isso eles usam "?" e são opcionais.
 */
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

/*
 * Representa uma solicitação cadastrada no sistema.
 */
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

/*
 * Representa uma decisão registrada no histórico.
 *
 * A cópia da requisição anterior permite restaurar o estado
 * quando o usuário desfaz a última operação.
 */
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
