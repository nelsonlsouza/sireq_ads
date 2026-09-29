export class StorageService {
  static salvar<T>(chave: string, valor: T): void {
    localStorage.setItem(chave, JSON.stringify(valor));
  }
  static carregar<T>(chave: string, padrao: T): T {
    const dado = localStorage.getItem(chave);
    if (!dado) return padrao;
    try { return JSON.parse(dado) as T; } catch { return padrao; }
  }
  static limpar(): void {
    ['sireq_fila','sireq_historico','sireq_em_analise'].forEach((chave) => localStorage.removeItem(chave));
  }
}