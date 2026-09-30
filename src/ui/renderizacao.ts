import type { OperacaoHistorico } from '../models/OperacaoHistorico';
import type { Requisicao } from '../models/Requisicao';
import { formatarData, formatarDetalhes, formatarMoeda } from './formatadores';

export function mostrarMensagem(texto: string, erro = false): void {
  const elemento = document.querySelector('#mensagem')!;
  elemento.innerHTML = `<div class="msg ${erro ? 'erro' : ''}">${texto}</div>`;
  setTimeout(() => (elemento.innerHTML = ''), 3000);
}

export function renderizarResumo(
  pendentes: Requisicao[],
  historico: OperacaoHistorico[]
): void {
  document.querySelector('#qtd')!.textContent = String(pendentes.length);
  document.querySelector('#histQtd')!.textContent = String(historico.length);
  document.querySelector('#filaInfo')!.textContent =
    `${pendentes.length} aguardando`;
}

export function renderizarFila(pendentes: Requisicao[]): void {
  const elemento = document.querySelector('#fila')!;

  if (pendentes.length === 0) {
    elemento.innerHTML = '<p class="empty">Nenhuma requisição pendente.</p>';
    return;
  }

  elemento.innerHTML = pendentes
    .map(
      (requisicao, indice) => `
        <div class="row">
          <span class="position">#${indice + 1}</span>
          <div>
            <b>${requisicao.id}</b>
            <small>${requisicao.setor} • ${requisicao.tipo} • ${requisicao.requisitante}</small>
          </div>
          <strong>${formatarMoeda(requisicao.valor)}</strong>
        </div>`
    )
    .join('');
}

export function renderizarAnalise(
  requisicao: Requisicao | undefined,
  emAnalise: boolean
): void {
  const elemento = document.querySelector('#analise')!;

  if (!requisicao) {
    elemento.innerHTML = '<p class="empty">A fila está vazia.</p>';
    return;
  }

  const controles = emAnalise
    ? `<label>Motivo (rejeição/devolução)<textarea id="motivo"></textarea></label>
       <div class="actions">
         <button data-decisao="APROVADA">Aprovar</button>
         <button data-decisao="DEVOLVIDA" class="warning">Devolver</button>
         <button data-decisao="REJEITADA" class="danger">Rejeitar</button>
       </div>`
    : `<div class="actions">
         <button id="iniciar">Iniciar análise</button>
         <button id="cancelar" class="danger ghost">Cancelar próxima</button>
       </div>`;

  elemento.innerHTML = `
    <div class="focus">
      <small>${emAnalise ? 'EM ANÁLISE' : 'PRÓXIMA DA FILA'}</small>
      <h3>${requisicao.descricao}</h3>
      <p><b>${requisicao.id}</b> • ${requisicao.setor} • ${requisicao.requisitante}</p>
      <p>${requisicao.justificativa}</p>
      <div class="detail-list">${formatarDetalhes(requisicao)}</div>
      <div class="meta">
        <span>Cadastrada em ${formatarData(requisicao.criadoEm)}</span>
        <strong>${formatarMoeda(requisicao.valor)}</strong>
      </div>
    </div>
    ${controles}`;
}

export function renderizarHistorico(historico: OperacaoHistorico[]): void {
  const elemento = document.querySelector('#historico')!;

  if (historico.length === 0) {
    elemento.innerHTML = '<p class="empty">Nenhuma decisão registrada.</p>';
    return;
  }

  elemento.innerHTML = historico
    .map((operacao) => {
      const requisicao = operacao.requisicaoAnterior;
      const motivo = operacao.motivo ? ` • Motivo: ${operacao.motivo}` : '';

      return `
        <div class="history-row">
          <div class="history-top">
            <div>
              <b>${operacao.requisicaoId} · ${operacao.acao}</b>
              <small>${requisicao.setor} • ${requisicao.tipo} • ${requisicao.requisitante}</small>
            </div>
            <span class="badge">${operacao.novoStatus}</span>
          </div>
          <div class="history-body">
            <span><b>Descrição:</b> ${requisicao.descricao}</span>
            <span><b>Justificativa:</b> ${requisicao.justificativa}</span>
            <div class="detail-list">${formatarDetalhes(requisicao)}</div>
            <div class="meta">
              <span>Decisão em ${formatarData(operacao.dataHora)}${motivo}</span>
              <strong>${formatarMoeda(requisicao.valor)}</strong>
            </div>
          </div>
        </div>`;
    })
    .join('');
}
