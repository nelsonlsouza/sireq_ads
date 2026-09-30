import './style.css';
import { Sireq } from './sireq';
import { iniciarTela } from './tela';

/*
 * PONTO DE ENTRADA DO SISTEMA
 *
 * Este arquivo é propositalmente pequeno.
 * Ele faz apenas duas coisas:
 * 1. cria o SIREQ;
 * 2. entrega o SIREQ para a tela.
 *
 * Fluxo:
 * main.ts -> tela.ts -> sireq.ts
 */
const sireq = new Sireq();
iniciarTela(sireq);
