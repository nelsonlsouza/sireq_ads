import type { Requisicao } from '../models/Requisicao';

export const formatarMoeda = (valor: number): string =>
  valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const formatarData = (valor: string): string =>
  new Date(valor).toLocaleString('pt-BR');

export function formatarDetalhes(requisicao: Requisicao): string {
  const dados = requisicao.dadosEspecificos ?? {};
  const linhas: string[] = [];

  if (requisicao.tipo === 'MATERIAL') {
    linhas.push(
      `Item: ${dados.item || '-'}`,
      `Quantidade: ${dados.quantidade || '-'}`,
      `Valor unitário: ${formatarMoeda(dados.valorUnitario || 0)}`
    );
  }

  if (requisicao.tipo === 'SERVICO') {
    linhas.push(
      `Fornecedor: ${dados.fornecedor || '-'}`,
      `Período: ${dados.periodo || '-'}`
    );
  }

  if (requisicao.tipo === 'VIAGEM') {
    linhas.push(
      `Destino: ${dados.destino || '-'}`,
      `Período: ${dados.periodo || '-'}`,
      `Finalidade: ${dados.finalidade || '-'}`
    );
  }

  if (requisicao.tipo === 'SOFTWARE') {
    linhas.push(
      `Software: ${dados.software || '-'}`,
      `Licenças: ${dados.licencas || '-'}`,
      `Período: ${dados.periodo || '-'}`
    );
  }

  if (requisicao.tipo === 'OUTROS') {
    linhas.push(`Detalhes: ${dados.descricaoDetalhada || '-'}`);
  }

  return linhas.map((linha) => `<span>${linha}</span>`).join('');
}
