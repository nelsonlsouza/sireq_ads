import type { Requisicao } from './tipos';

type NovaRequisicao = Omit<Requisicao, 'id' | 'status' | 'criadoEm'>;

/**
 * Concentra as validações do formulário.
 * Retorna uma lista de erros; lista vazia significa dados válidos.
 */
export class Validador {
  static validar(dados: NovaRequisicao): string[] {
    const erros: string[] = [];

    // 1. Campos comuns a qualquer tipo de requisição.
    if (!dados.setor.trim()) {
      erros.push('Setor é obrigatório.');
    }

    if (!dados.requisitante.trim()) {
      erros.push('Requisitante é obrigatório.');
    }

    if (!dados.descricao.trim()) {
      erros.push('Descrição é obrigatória.');
    }

    if (dados.justificativa.trim().length < 20) {
      erros.push('A justificativa deve ter no mínimo 20 caracteres.');
    }

    if (!Number.isFinite(dados.valor) || dados.valor < 0) {
      erros.push('Valor deve ser válido.');
    }

    // 2. Campos que mudam conforme o tipo escolhido.
    const especificos = dados.dadosEspecificos;

    if (dados.tipo === 'MATERIAL') {
      if (!especificos.item?.trim()) {
        erros.push('Informe o item do material.');
      }
      if (!especificos.quantidade || especificos.quantidade <= 0) {
        erros.push('Informe uma quantidade válida.');
      }
      if (
        especificos.valorUnitario === undefined ||
        especificos.valorUnitario < 0
      ) {
        erros.push('Informe o valor unitário.');
      }
    }

    if (dados.tipo === 'SERVICO') {
      if (!especificos.fornecedor?.trim()) {
        erros.push('Informe o fornecedor.');
      }
      if (!especificos.periodo?.trim()) {
        erros.push('Informe o período do serviço.');
      }
    }

    if (dados.tipo === 'VIAGEM') {
      if (!especificos.destino?.trim()) {
        erros.push('Informe o destino.');
      }
      if (!especificos.periodo?.trim()) {
        erros.push('Informe o período da viagem.');
      }
      if (!especificos.finalidade?.trim()) {
        erros.push('Informe a finalidade da viagem.');
      }
    }

    if (dados.tipo === 'SOFTWARE') {
      if (!especificos.software?.trim()) {
        erros.push('Informe o nome do software.');
      }
      if (!especificos.licencas || especificos.licencas <= 0) {
        erros.push('Informe a quantidade de licenças.');
      }
      if (!especificos.periodo?.trim()) {
        erros.push('Informe o período da licença.');
      }
    }

    if (
      dados.tipo === 'OUTROS' &&
      !especificos.descricaoDetalhada?.trim()
    ) {
      erros.push('Informe a descrição detalhada.');
    }

    return erros;
  }
}
