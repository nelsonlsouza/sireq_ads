const CHAVES = {
  fila: 'sireq_fila',
  historico: 'sireq_historico',
  emAnalise: 'sireq_em_analise'
} as const;

/**
 * Isola o acesso ao localStorage para que a regra de negócio
 * não dependa diretamente da API do navegador.
 */
export class StorageService {
  static salvar<T>(chave: string, valor: T): void {
    localStorage.setItem(chave, JSON.stringify(valor));
  }

  static carregar<T>(chave: string, padrao: T): T {
    const dado = localStorage.getItem(chave);

    if (!dado) {
      return padrao;
    }

    try {
      return JSON.parse(dado) as T;
    } catch {
      return padrao;
    }
  }

  static limpar(): void {
    Object.values(CHAVES).forEach((chave) => localStorage.removeItem(chave));
  }
}
