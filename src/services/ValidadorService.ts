import type { Requisicao } from '../models/Requisicao';

export class ValidadorService {
  static validar(dados: Omit<Requisicao, 'id' | 'status' | 'criadoEm'>): string[] {
    const erros: string[] = [];
    if (!dados.setor.trim()) erros.push('Setor é obrigatório.');
    if (!dados.requisitante.trim()) erros.push('Requisitante é obrigatório.');
    if (!dados.descricao.trim()) erros.push('Descrição é obrigatória.');
    if (dados.justificativa.trim().length < 20) erros.push('A justificativa deve ter no mínimo 20 caracteres.');
    if (!Number.isFinite(dados.valor) || dados.valor < 0) erros.push('Valor deve ser válido.');

    const e = dados.dadosEspecificos;
    if (dados.tipo === 'MATERIAL') {
      if (!e.item?.trim()) erros.push('Informe o item do material.');
      if (!e.quantidade || e.quantidade <= 0) erros.push('Informe uma quantidade válida.');
      if (e.valorUnitario === undefined || e.valorUnitario < 0) erros.push('Informe o valor unitário.');
    }
    if (dados.tipo === 'SERVICO') {
      if (!e.fornecedor?.trim()) erros.push('Informe o fornecedor.');
      if (!e.periodo?.trim()) erros.push('Informe o período do serviço.');
    }
    if (dados.tipo === 'VIAGEM') {
      if (!e.destino?.trim()) erros.push('Informe o destino.');
      if (!e.periodo?.trim()) erros.push('Informe o período da viagem.');
      if (!e.finalidade?.trim()) erros.push('Informe a finalidade da viagem.');
    }
    if (dados.tipo === 'SOFTWARE') {
      if (!e.software?.trim()) erros.push('Informe o nome do software.');
      if (!e.licencas || e.licencas <= 0) erros.push('Informe a quantidade de licenças.');
      if (!e.periodo?.trim()) erros.push('Informe o período da licença.');
    }
    if (dados.tipo === 'OUTROS' && !e.descricaoDetalhada?.trim()) {
      erros.push('Informe a descrição detalhada.');
    }
    return erros;
  }
}