import { describe, expect, it } from 'vitest';
import { Fila } from '../src/fila';
import { Pilha } from '../src/pilha';

describe('Fila FIFO', () => {
  it('mantém A, B, C e remove A primeiro', () => {
    const fila = new Fila<string>();

    fila.enfileirar('A');
    fila.enfileirar('B');
    fila.enfileirar('C');

    expect(fila.listar()).toEqual(['A', 'B', 'C']);
    expect(fila.desenfileirar()).toBe('A');
    expect(fila.frente()).toBe('B');
  });

  it('trata fila vazia', () => {
    const fila = new Fila();
    expect(fila.desenfileirar()).toBeUndefined();
  });
});

describe('Pilha LIFO', () => {
  it('remove C primeiro', () => {
    const pilha = new Pilha<string>();

    pilha.empilhar('A');
    pilha.empilhar('B');
    pilha.empilhar('C');

    expect(pilha.consultarTopo()).toBe('C');
    expect(pilha.desempilhar()).toBe('C');
    expect(pilha.consultarTopo()).toBe('B');
  });

  it('trata pilha vazia', () => {
    const pilha = new Pilha();
    expect(pilha.desempilhar()).toBeUndefined();
  });
});
