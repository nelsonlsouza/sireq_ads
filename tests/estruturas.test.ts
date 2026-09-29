import { describe, expect, it } from 'vitest';
import { Fila } from '../src/structures/Fila';
import { Pilha } from '../src/structures/Pilha';

describe('Fila FIFO',()=>{it('mantém A, B, C e remove A primeiro',()=>{const f=new Fila<string>();f.enfileirar('A');f.enfileirar('B');f.enfileirar('C');expect(f.listar()).toEqual(['A','B','C']);expect(f.desenfileirar()).toBe('A');expect(f.frente()).toBe('B')});it('trata fila vazia',()=>{const f=new Fila();expect(f.desenfileirar()).toBeUndefined()})});
describe('Pilha LIFO',()=>{it('remove C primeiro',()=>{const p=new Pilha<string>();p.empilhar('A');p.empilhar('B');p.empilhar('C');expect(p.consultarTopo()).toBe('C');expect(p.desempilhar()).toBe('C');expect(p.consultarTopo()).toBe('B')});it('trata pilha vazia',()=>{const p=new Pilha();expect(p.desempilhar()).toBeUndefined()})});
