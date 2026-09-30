/**
 * Estrutura LIFO (Last In, First Out).
 * A operação mais recente é a primeira disponível para desfazimento.
 */
export class Pilha<T> {
  private itens: T[] = [];

  empilhar(item: T): void {
    this.itens.push(item);
  }

  desempilhar(): T | undefined {
    return this.itens.pop();
  }

  consultarTopo(): T | undefined {
    return this.itens[this.itens.length - 1];
  }

  vazia(): boolean {
    return this.itens.length === 0;
  }

  quantidade(): number {
    return this.itens.length;
  }

  listar(): T[] {
    return [...this.itens].reverse();
  }

  carregar(itens: T[]): void {
    this.itens = [...itens];
  }

  listarOrdemInterna(): T[] {
    return [...this.itens];
  }
}
