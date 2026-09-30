// Pilha LIFO: o último item que entra é o primeiro que sai.
// No SIREQ, isso permite desfazer primeiro a decisão mais recente.
export class Pilha<T> {
  private itens: T[] = [];

  // Adiciona um item no topo.
  empilhar(item: T): void {
    this.itens.push(item);
  }

  // Remove o item que está no topo.
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

  // Exibe primeiro as operações mais recentes.
  listar(): T[] {
    return [...this.itens].reverse();
  }

  // Recarrega a pilha salva anteriormente.
  carregar(itens: T[]): void {
    this.itens = [...itens];
  }

  // Mantém a ordem original ao salvar.
  listarOrdemInterna(): T[] {
    return [...this.itens];
  }
}
