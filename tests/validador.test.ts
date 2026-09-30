import { describe, expect, it } from 'vitest';
import { Validador } from '../src/validador';
import type { Requisicao } from '../src/tipos';

type Entrada = Omit<Requisicao, 'id' | 'status' | 'criadoEm'>;

const requisicaoValida: Entrada = {
  setor: 'TI',
  requisitante: 'Usuario Teste',
  tipo: 'MATERIAL',
  descricao: 'Compra de material',
  justificativa: 'Justificativa valida com mais de vinte caracteres.',
  valor: 100,
  dadosEspecificos: {
    item: 'Teclado',
    quantidade: 2,
    valorUnitario: 50
  }
};

describe('Validador', () => {
  it('aceita uma requisicao valida', () => {
    expect(Validador.validar(requisicaoValida)).toEqual([]);
  });

  it('rejeita justificativa com menos de 20 caracteres', () => {
    const erros = Validador.validar({
      ...requisicaoValida,
      justificativa: 'Curta'
    });

    expect(erros).toContain(
      'A justificativa deve ter no mínimo 20 caracteres.'
    );
  });

  it('valida os campos obrigatorios de material', () => {
    const erros = Validador.validar({
      ...requisicaoValida,
      dadosEspecificos: {
        item: '',
        quantidade: 0,
        valorUnitario: -1
      }
    });

    expect(erros).toHaveLength(3);
  });

  it('valida os campos obrigatorios de viagem', () => {
    const erros = Validador.validar({
      ...requisicaoValida,
      tipo: 'VIAGEM',
      dadosEspecificos: {
        destino: '',
        periodo: '',
        finalidade: ''
      }
    });

    expect(erros).toHaveLength(3);
  });

  it('valida os campos obrigatorios de software', () => {
    const erros = Validador.validar({
      ...requisicaoValida,
      tipo: 'SOFTWARE',
      dadosEspecificos: {
        software: '',
        licencas: 0,
        periodo: ''
      }
    });

    expect(erros).toHaveLength(3);
  });
});
