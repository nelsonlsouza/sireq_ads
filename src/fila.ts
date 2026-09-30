// Fila FIFO: o primeiro item que entra é o primeiro que sai.
// No SIREQ, isso mantém as requisições na ordem em que foram cadastradas.
export class Fila<T> {
  private itens: T[] = [];

  // Coloca um item no final da fila.
  enfileirar(item: T): void {
    this.itens.push(item);
  }

  // Retira o primeiro item da fila.
  desenfileirar(): T | undefined {
    return this.itens.shift();
  }

  // Consulta o primeiro item sem retirar.
  frente(): T | undefined {
    return this.itens[0];
  }

  vazia(): boolean {
    return this.itens.length === 0;
  }

  quantidade(): number {
    return this.itens.length;
  }

  // Retorna uma cópia para não alterar a fila diretamente fora da classe.
  listar(): T[] {
    return [...this.itens];
  }

  // Recarrega os itens que foram salvos.
  carregar(itens: T[]): void {
    this.itens = [...itens];
  }

  // Usado quando uma operação é desfeita.
  inserirNoInicio(item: T): void {
    this.itens.unshift(item);
  }
}
