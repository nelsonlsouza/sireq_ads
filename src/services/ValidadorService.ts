import type { Requisicao } from '../models/Requisicao';

export class ValidadorService {
  static validar(dados: Omit<Requisicao, 'id' | 'status' | 'criadoEm'>): string[] {
    const erros: string[] = [];
    if (!dados.setor.trim()) erros.push('Setor é obrigatório.');
    if (!dados.requisitante.trim()) erros.push('Requisitante é obrigatório.');
    if (!dados.descricao.trim()) erros.push('Descrição é obrigatória.');
    if (!dados.justificativa.trim()) erros.push('Justificativa é obrigatória.');
    if (!Number.isFinite(dados.valor) || dados.valor < 0) erros.push('Valor deve ser válido.');
    return erros;
  }
}