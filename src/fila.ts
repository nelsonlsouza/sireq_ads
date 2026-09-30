/**
 * FILA = FIFO (First In, First Out)
 *
 * Exemplo:
 * entra A -> entra B -> entra C
 * sai A   -> depois B -> depois C
 *
 * No SIREQ, a fila garante que as requisições sejam analisadas
 * na mesma ordem em que foram cadastradas.
 */
export class Fila<T> {
  private itens: T[] = [];

  // Adiciona um novo item no FINAL da fila.
  enfileirar(item: T): void {
    this.itens.push(item);
  }

  // Remove e devolve o PRIMEIRO item da fila.
  desenfileirar(): T | undefined {
    return this.itens.shift();
  }

  // Consulta o primeiro item sem removê-lo.
  frente(): T | undefined {
    return this.itens[0];
  }

  // Informa se a fila está vazia.
  vazia(): boolean {
    return this.itens.length === 0;
  }

  // Informa quantos itens existem na fila.
  quantidade(): number {
    return this.itens.length;
  }

  // Retorna uma cópia para impedir alterações diretas na fila.
  listar(): T[] {
    return [...this.itens];
  }

  // Restaura a fila a partir de dados salvos.
  carregar(itens: T[]): void {
    this.itens = [...itens];
  }

  // Usado no desfazer para restaurar a última requisição tratada.
  inserirNoInicio(item: T): void {
    this.itens.unshift(item);
  }
}
