/**
 * Estrutura FIFO (First In, First Out).
 * A primeira requisição que entra é a primeira que sai para análise.
 */
export class Fila<T> {
  private itens: T[] = [];

  enfileirar(item: T): void {
    this.itens.push(item);
  }

  desenfileirar(): T | undefined {
    return this.itens.shift();
  }

  frente(): T | undefined {
    return this.itens[0];
  }

  vazia(): boolean {
    return this.itens.length === 0;
  }

  quantidade(): number {
    return this.itens.length;
  }

  listar(): T[] {
    return [...this.itens];
  }

  carregar(itens: T[]): void {
    this.itens = [...itens];
  }

  inserirNoInicio(item: T): void {
    this.itens.unshift(item);
  }
}
