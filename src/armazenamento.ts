// Chaves usadas para salvar os dados do sistema no navegador.
export const CHAVES_STORAGE = {
  fila: 'sireq_fila',
  historico: 'sireq_historico',
  emAnalise: 'sireq_em_analise'
} as const;

// Centraliza o acesso ao localStorage.
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
      // Se o dado salvo estiver inválido, usamos o valor padrão.
      return valorPadrao;
    }
  }

  static limpar(): void {
    Object.values(CHAVES_STORAGE).forEach((chave) => {
      localStorage.removeItem(chave);
    });
  }
}
