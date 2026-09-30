/*
 * FILA - FIFO
 * First In, First Out = Primeiro a Entrar, Primeiro a Sair.
 *
 * Exemplo visual:
 *
 * ENTRADA -> [ A ] [ B ] [ C ] -> SAÍDA
 *                                  ^
 *                                  A sai primeiro
 *
 * No SIREQ:
 * A = primeira requisição cadastrada
 * B = segunda requisição cadastrada
 * C = terceira requisição cadastrada
 *
 * Portanto, A obrigatoriamente será analisada antes de B e C.
 */
export class Fila<T> {
  /*
   * O <T> significa que a fila pode guardar qualquer tipo de dado.
   * No SIREQ, usamos Fila<Requisicao>.
   */
  private itens: T[] = [];

  /*
   * ENFILEIRAR
   * push() adiciona no FINAL do array.
   */
  enfileirar(item: T): void {
    this.itens.push(item);
  }

  /*
   * DESENFILEIRAR
   * shift() remove o PRIMEIRO elemento.
   * É esta operação que produz o comportamento FIFO.
   */
  desenfileirar(): T | undefined {
    return this.itens.shift();
  }

  /*
   * Consulta quem é o primeiro da fila SEM remover.
   */
  frente(): T | undefined {
    return this.itens[0];
  }

  vazia(): boolean {
    return this.itens.length === 0;
  }

  quantidade(): number {
    return this.itens.length;
  }

  /*
   * Retorna uma cópia da fila.
   * Assim, quem recebe a lista não altera o array interno diretamente.
   */
  listar(): T[] {
    return [...this.itens];
  }

  /*
   * Usado quando os dados são recuperados do localStorage.
   */
  carregar(itens: T[]): void {
    this.itens = [...itens];
  }

  /*
   * Usado pelo recurso "desfazer".
   * A requisição restaurada volta para a frente da fila.
   */
  inserirNoInicio(item: T): void {
    this.itens.unshift(item);
  }
}
