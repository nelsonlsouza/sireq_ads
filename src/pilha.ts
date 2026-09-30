/*
 * PILHA - LIFO
 * Last In, First Out = Último a Entrar, Primeiro a Sair.
 *
 * Exemplo visual:
 *
 *      [ C ] <- topo
 *      [ B ]
 *      [ A ]
 *
 * C foi a última operação registrada.
 * Portanto, C será a primeira operação removida ao desfazer.
 */
export class Pilha<T> {
  /*
   * No SIREQ, usamos Pilha<OperacaoHistorico>.
   */
  private itens: T[] = [];

  /*
   * EMPILHAR
   * push() coloca uma nova operação no TOPO da pilha.
   */
  empilhar(item: T): void {
    this.itens.push(item);
  }

  /*
   * DESEMPILHAR
   * pop() remove a operação que está no TOPO.
   * É esta operação que produz o comportamento LIFO.
   */
  desempilhar(): T | undefined {
    return this.itens.pop();
  }

  /*
   * Consulta o topo sem remover.
   */
  consultarTopo(): T | undefined {
    return this.itens[this.itens.length - 1];
  }

  vazia(): boolean {
    return this.itens.length === 0;
  }

  quantidade(): number {
    return this.itens.length;
  }

  /*
   * Para exibição, mostramos primeiro a operação mais recente.
   */
  listar(): T[] {
    return [...this.itens].reverse();
  }

  /*
   * Recupera a pilha salva no localStorage.
   */
  carregar(itens: T[]): void {
    this.itens = [...itens];
  }

  /*
   * Retorna a ordem interna original para persistência.
   */
  listarOrdemInterna(): T[] {
    return [...this.itens];
  }
}
