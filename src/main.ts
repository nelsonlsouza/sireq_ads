import './style.css';
import { Sireq } from './sireq';
import { iniciarTela } from './tela';

// Aqui começa a aplicação.
// Criamos o sistema e passamos a instância para a tela.
const sireq = new Sireq();
iniciarTela(sireq);
