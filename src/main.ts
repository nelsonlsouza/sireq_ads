import './style.css';
import { Sireq } from './sireq';
import { iniciarTela } from './tela';

// main.ts é o ponto de partida da aplicação.
// Ele apenas cria o sistema e inicia a interface.
const sireq = new Sireq();
iniciarTela(sireq);
