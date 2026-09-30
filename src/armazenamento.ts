// Nomes usados no localStorage.
// Centralizar as chaves evita textos repetidos e erros de digitação.
export const CHAVES_STORAGE = {
  fila: 'sireq_fila',
  historico: 'sireq_historico',
  emAnalise: 'sireq_em_analise'
} as const;

/**
 * Responsável SOMENTE por salvar, carregar e apagar dados locais.
 * A regra de negócio não precisa conhecer detalhes do localStorage.
 */
export class Armazenamento {
  static salvar<T>(chave: string, valor: T): void {
    localStorage.setItem(chave, JSON.stringify(valor));
  }

  static carregar<T>(chave: string, valorPadrao: T): T {
    const dado = localStorage.getItem(chave);

    if (!dado) {
      return valorPadrao;
    }

    try {
      return JSON.parse(dado) as T;
    } catch {
      // Se houver dado inválido, o sistema volta ao valor padrão
      // em vez de interromper a aplicação.
      return valorPadrao;
    }
  }

  static limpar(): void {
    Object.values(CHAVES_STORAGE).forEach((chave) => {
      localStorage.removeItem(chave);
    });
  }
}
