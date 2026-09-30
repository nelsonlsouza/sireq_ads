/**
 * PILHA = LIFO (Last In, First Out)
 *
 * Exemplo:
 * empilha A -> empilha B -> empilha C
 * sai C     -> depois B   -> depois A
 *
 * No SIREQ, a pilha registra as decisões.
 * Assim, a decisão mais recente é a primeira que pode ser desfeita.
 */
export class Pilha<T> {
  private itens: T[] = [];

  // Coloca um item no TOPO da pilha.
  empilhar(item: T): void {
    this.itens.push(item);
  }

  // Remove e devolve o item do TOPO.
  desempilhar(): T | undefined {
    return this.itens.pop();
  }

  // Consulta o topo sem remover.
  consultarTopo(): T | undefined {
    return this.itens[this.itens.length - 1];
  }

  vazia(): boolean {
    return this.itens.length === 0;
  }

  quantidade(): number {
    return this.itens.length;
  }

  // Mostra primeiro a operação mais recente.
  listar(): T[] {
    return [...this.itens].reverse();
  }

  // Restaura a pilha a partir de dados salvos.
  carregar(itens: T[]): void {
    this.itens = [...itens];
  }

  // Usado apenas para salvar a ordem real da pilha.
  listarOrdemInterna(): T[] {
    return [...this.itens];
  }
}
