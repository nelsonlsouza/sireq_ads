import './style.css';
import type { TipoRequisicao } from './models/Requisicao';
import { SireqService } from './services/SireqService';
import { lerDadosEspecificos, renderizarCamposEspecificos } from './ui/formulario';
import {
  mostrarMensagem,
  renderizarAnalise,
  renderizarFila,
  renderizarHistorico,
  renderizarResumo
} from './ui/renderizacao';
import { templatePrincipal } from './ui/template';

const sireq = new SireqService();
const app = document.querySelector<HTMLDivElement>('#app')!;

app.innerHTML = templatePrincipal;

function executarAcao(acao: () => unknown, mensagem: string): void {
  try {
    acao();
    mostrarMensagem(mensagem);
    renderizarSistema();
  } catch (erro) {
    mostrarMensagem(
      erro instanceof Error ? erro.message : 'Erro inesperado.',
      true
    );
  }
}

function renderizarSistema(): void {
  const pendentes = sireq.pendentes();
  const historico = sireq.historicoCompleto();
  const atual = sireq.atual();

  renderizarResumo(pendentes, historico);
  renderizarFila(pendentes);
  renderizarAnalise(atual ?? sireq.proxima(), Boolean(atual));
  renderizarHistorico(historico);
  configurarEventosDaAnalise();
}

function configurarEventosDaAnalise(): void {
  document.querySelector('#iniciar')?.addEventListener('click', () => {
    executarAcao(
      () => sireq.iniciarAnalise(),
      'Requisição encaminhada para análise.'
    );
  });

  document.querySelector('#cancelar')?.addEventListener('click', () => {
    const motivo = prompt('Motivo do cancelamento:') ?? '';
    executarAcao(() => sireq.cancelarProxima(motivo), 'Requisição cancelada.');
  });

  document
    .querySelectorAll<HTMLButtonElement>('[data-decisao]')
    .forEach((botao) => {
      botao.addEventListener('click', () => {
        const status = botao.dataset.decisao as
          | 'APROVADA'
          | 'REJEITADA'
          | 'DEVOLVIDA';

        const motivo =
          document.querySelector<HTMLTextAreaElement>('#motivo')?.value ?? '';

        executarAcao(
          () => sireq.decidir(status, motivo),
          'Decisão registrada.'
        );
      });
    });
}

function configurarFormulario(): void {
  const tipoSelect = document.querySelector<HTMLSelectElement>('#tipo')!;
  const formulario = document.querySelector<HTMLFormElement>('#form')!;

  renderizarCamposEspecificos(tipoSelect.value as TipoRequisicao);

  tipoSelect.addEventListener('change', () => {
    renderizarCamposEspecificos(tipoSelect.value as TipoRequisicao);
  });

  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();

    const formData = new FormData(formulario);
    const tipo = String(formData.get('tipo')) as TipoRequisicao;

    executarAcao(
      () =>
        sireq.cadastrar({
          setor: String(formData.get('setor')),
          requisitante: String(formData.get('requisitante')),
          tipo,
          descricao: String(formData.get('descricao')),
          justificativa: String(formData.get('justificativa')),
          valor: Number(formData.get('valor')),
          dadosEspecificos: lerDadosEspecificos(formData)
        }),
      'Requisição cadastrada.'
    );

    formulario.reset();
    renderizarCamposEspecificos(tipoSelect.value as TipoRequisicao);
  });
}

function configurarEventosGerais(): void {
  document.querySelector('#desfazer')!.addEventListener('click', () => {
    executarAcao(
      () => sireq.desfazerUltima(),
      'Última operação desfeita.'
    );
  });

  document.querySelector('#limpar')!.addEventListener('click', () => {
    if (!confirm('Limpar todos os dados?')) {
      return;
    }

    sireq.limpar();
    renderizarSistema();
    mostrarMensagem('Dados removidos.');
  });
}

configurarFormulario();
configurarEventosGerais();
renderizarSistema();
