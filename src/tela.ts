import type {
  DadosEspecificos,
  OperacaoHistorico,
  Requisicao,
  TipoRequisicao
} from './tipos';
import type { Sireq } from './sireq';

/**
 * Tudo que aparece na tela fica neste arquivo.
 *
 * Regra simples para explicar:
 * - sireq.ts = regras do sistema
 * - tela.ts  = interface que o usuário vê
 */

// -------------------- HTML PRINCIPAL --------------------

const HTML_PRINCIPAL = `
<header>
  <div class="brand">
    <div class="brand-mark">S</div>
    <div><strong>SIREQ</strong><span>Requisições e aprovações</span></div>
  </div>
  <button id="limpar" class="text-button">Limpar dados</button>
</header>

<main>
  <section class="page-head">
    <div>
      <span class="section-label">Visão geral</span>
      <h1>Requisições</h1>
      <p>Acompanhe solicitações, análises e decisões em um só lugar.</p>
    </div>
    <div class="stats">
      <article><span>Pendentes</span><b id="qtd">0</b></article>
      <article><span>Decisões</span><b id="histQtd">0</b></article>
    </div>
  </section>

  <div id="mensagem"></div>

  <section class="grid">
    <article class="card">
      <div class="card-head">
        <div><h2>Nova requisição</h2><p>Preencha os dados da solicitação.</p></div>
      </div>

      <form id="form">
        <label>Setor<input name="setor" required placeholder="Ex.: TI"></label>
        <label>Requisitante<input name="requisitante" required></label>

        <div class="two">
          <label>
            Tipo
            <select name="tipo" id="tipo">
              <option value="MATERIAL">Material</option>
              <option value="SERVICO">Serviço</option>
              <option value="VIAGEM">Viagem</option>
              <option value="SOFTWARE">Software</option>
              <option value="OUTROS">Outros</option>
            </select>
          </label>

          <label>
            Valor estimado (R$)
            <input name="valor" type="number" min="0" step="0.01" required>
          </label>
        </div>

        <label>Descrição<input name="descricao" required></label>
        <div id="camposEspecificos"></div>

        <label>
          Justificativa <span class="hint">mínimo 20 caracteres</span>
          <textarea name="justificativa" minlength="20" required></textarea>
        </label>

        <button type="submit">Cadastrar requisição</button>
      </form>
    </article>

    <article class="card">
      <div class="card-head title-row">
        <div><h2>Análise</h2><p>Próxima solicitação aguardando decisão.</p></div>
        <span class="status-neutral">Pendente</span>
      </div>
      <div id="analise"></div>
    </article>
  </section>

  <section class="card wide">
    <div class="card-head title-row">
      <div><h2>Solicitações pendentes</h2><p>Organizadas por ordem de entrada.</p></div>
      <span id="filaInfo" class="counter"></span>
    </div>
    <div id="fila"></div>
  </section>

  <section class="card wide">
    <div class="card-head title-row">
      <div><h2>Histórico</h2><p>Registro das decisões realizadas.</p></div>
      <button id="desfazer" class="secondary">Desfazer última</button>
    </div>
    <div id="historico"></div>
  </section>
</main>
`;

// -------------------- CAMPOS POR TIPO --------------------

const CAMPOS_POR_TIPO: Record<TipoRequisicao, string> = {
  MATERIAL:
    '<div class="specific"><div class="two"><label>Item<input name="item" required></label><label>Quantidade<input name="quantidade" type="number" min="1" required></label></div><label>Valor unitário (R$)<input name="valorUnitario" type="number" min="0" step="0.01" required></label></div>',
  SERVICO:
    '<div class="specific"><label>Fornecedor<input name="fornecedor" required></label><label>Período<input name="periodo" required placeholder="Ex.: 01/10/2026 a 15/10/2026"></label></div>',
  VIAGEM:
    '<div class="specific"><label>Destino<input name="destino" required></label><label>Período<input name="periodo" required placeholder="Ex.: 10/10/2026 a 14/10/2026"></label><label>Finalidade<input name="finalidade" required></label></div>',
  SOFTWARE:
    '<div class="specific"><label>Nome do software<input name="software" required></label><div class="two"><label>Licenças<input name="licencas" type="number" min="1" required></label><label>Período<input name="periodo" required placeholder="Ex.: 12 meses"></label></div></div>',
  OUTROS:
    '<div class="specific"><label>Descrição detalhada<textarea name="descricaoDetalhada" required></textarea></label></div>'
};

// -------------------- FUNÇÕES AUXILIARES --------------------

function moeda(valor: number): string {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

function data(valor: string): string {
  return new Date(valor).toLocaleString('pt-BR');
}

// Evita que texto digitado pelo usuário seja interpretado como HTML.
function textoSeguro(valor: unknown): string {
  return String(valor ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function detalhes(requisicao: Requisicao): string {
  const e = requisicao.dadosEspecificos ?? {};
  const linhas: string[] = [];

  if (requisicao.tipo === 'MATERIAL') {
    linhas.push(
      `Item: ${textoSeguro(e.item || '-')}`,
      `Quantidade: ${textoSeguro(e.quantidade || '-')}`,
      `Valor unitário: ${moeda(e.valorUnitario || 0)}`
    );
  }

  if (requisicao.tipo === 'SERVICO') {
    linhas.push(
      `Fornecedor: ${textoSeguro(e.fornecedor || '-')}`,
      `Período: ${textoSeguro(e.periodo || '-')}`
    );
  }

  if (requisicao.tipo === 'VIAGEM') {
    linhas.push(
      `Destino: ${textoSeguro(e.destino || '-')}`,
      `Período: ${textoSeguro(e.periodo || '-')}`,
      `Finalidade: ${textoSeguro(e.finalidade || '-')}`
    );
  }

  if (requisicao.tipo === 'SOFTWARE') {
    linhas.push(
      `Software: ${textoSeguro(e.software || '-')}`,
      `Licenças: ${textoSeguro(e.licencas || '-')}`,
      `Período: ${textoSeguro(e.periodo || '-')}`
    );
  }

  if (requisicao.tipo === 'OUTROS') {
    linhas.push(`Detalhes: ${textoSeguro(e.descricaoDetalhada || '-')}`);
  }

  return linhas.map((linha) => `<span>${linha}</span>`).join('');
}

function lerDadosEspecificos(form: FormData): DadosEspecificos {
  return {
    item: String(form.get('item') ?? ''),
    quantidade: Number(form.get('quantidade') || 0),
    valorUnitario: Number(form.get('valorUnitario') || 0),
    fornecedor: String(form.get('fornecedor') ?? ''),
    periodo: String(form.get('periodo') ?? ''),
    destino: String(form.get('destino') ?? ''),
    finalidade: String(form.get('finalidade') ?? ''),
    software: String(form.get('software') ?? ''),
    licencas: Number(form.get('licencas') || 0),
    descricaoDetalhada: String(form.get('descricaoDetalhada') ?? '')
  };
}

// -------------------- INICIALIZAÇÃO DA TELA --------------------

export function iniciarTela(sireq: Sireq): void {
  const app = document.querySelector<HTMLDivElement>('#app')!;
  app.innerHTML = HTML_PRINCIPAL;

  const tipoSelect = document.querySelector<HTMLSelectElement>('#tipo')!;
  const formulario = document.querySelector<HTMLFormElement>('#form')!;

  function mostrarMensagem(mensagem: string, erro = false): void {
    const elemento = document.querySelector('#mensagem')!;

    elemento.innerHTML =
      `<div class="msg ${erro ? 'erro' : ''}">${textoSeguro(mensagem)}</div>`;

    setTimeout(() => {
      elemento.innerHTML = '';
    }, 3000);
  }

  // Executa uma ação e mostra erro amigável caso alguma regra impeça a operação.
  function executar(acao: () => unknown, sucesso: string): void {
    try {
      acao();
      mostrarMensagem(sucesso);
      renderizar();
    } catch (erro) {
      mostrarMensagem(
        erro instanceof Error ? erro.message : 'Erro inesperado.',
        true
      );
    }
  }

  function renderizarCampos(): void {
    const tipo = tipoSelect.value as TipoRequisicao;
    document.querySelector<HTMLDivElement>('#camposEspecificos')!.innerHTML =
      CAMPOS_POR_TIPO[tipo];
  }

  function renderizar(): void {
    const pendentes = sireq.pendentes();
    const historico = sireq.historicoCompleto();
    const atual = sireq.atual();

    renderizarResumo(pendentes, historico);
    renderizarFila(pendentes);
    renderizarAnalise(atual ?? sireq.proxima(), Boolean(atual));
    renderizarHistorico(historico);

    // Os botões da análise são recriados no HTML.
    // Por isso os eventos deles precisam ser ligados novamente.
    configurarBotoesDaAnalise();
  }

  function renderizarResumo(
    pendentes: Requisicao[],
    historico: OperacaoHistorico[]
  ): void {
    document.querySelector('#qtd')!.textContent = String(pendentes.length);
    document.querySelector('#histQtd')!.textContent = String(historico.length);
    document.querySelector('#filaInfo')!.textContent =
      `${pendentes.length} aguardando`;
  }

  function renderizarFila(pendentes: Requisicao[]): void {
    const elemento = document.querySelector('#fila')!;

    if (pendentes.length === 0) {
      elemento.innerHTML = '<p class="empty">Nenhuma requisição pendente.</p>';
      return;
    }

    elemento.innerHTML = pendentes
      .map(
        (r, indice) => `
        <div class="row">
          <span class="position">#${indice + 1}</span>
          <div>
            <b>${textoSeguro(r.id)}</b>
            <small>${textoSeguro(r.setor)} • ${textoSeguro(r.tipo)} • ${textoSeguro(r.requisitante)}</small>
          </div>
          <strong>${moeda(r.valor)}</strong>
        </div>`
      )
      .join('');
  }

  function renderizarAnalise(
    requisicao: Requisicao | undefined,
    emAnalise: boolean
  ): void {
    const elemento = document.querySelector('#analise')!;

    if (!requisicao) {
      elemento.innerHTML = '<p class="empty">A fila está vazia.</p>';
      return;
    }

    const botoes = emAnalise
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
        <h3>${textoSeguro(requisicao.descricao)}</h3>
        <p><b>${textoSeguro(requisicao.id)}</b> • ${textoSeguro(requisicao.setor)} • ${textoSeguro(requisicao.requisitante)}</p>
        <p>${textoSeguro(requisicao.justificativa)}</p>
        <div class="detail-list">${detalhes(requisicao)}</div>
        <div class="meta">
          <span>Cadastrada em ${data(requisicao.criadoEm)}</span>
          <strong>${moeda(requisicao.valor)}</strong>
        </div>
      </div>
      ${botoes}`;
  }

  function renderizarHistorico(historico: OperacaoHistorico[]): void {
    const elemento = document.querySelector('#historico')!;

    if (historico.length === 0) {
      elemento.innerHTML = '<p class="empty">Nenhuma decisão registrada.</p>';
      return;
    }

    elemento.innerHTML = historico
      .map((operacao) => {
        const r = operacao.requisicaoAnterior;
        const motivo = operacao.motivo
          ? ` • Motivo: ${textoSeguro(operacao.motivo)}`
          : '';

        return `
          <div class="history-row">
            <div class="history-top">
              <div>
                <b>${textoSeguro(operacao.requisicaoId)} · ${textoSeguro(operacao.acao)}</b>
                <small>${textoSeguro(r.setor)} • ${textoSeguro(r.tipo)} • ${textoSeguro(r.requisitante)}</small>
              </div>
              <span class="badge">${textoSeguro(operacao.novoStatus)}</span>
            </div>

            <div class="history-body">
              <span><b>Descrição:</b> ${textoSeguro(r.descricao)}</span>
              <span><b>Justificativa:</b> ${textoSeguro(r.justificativa)}</span>
              <div class="detail-list">${detalhes(r)}</div>
              <div class="meta">
                <span>Decisão em ${data(operacao.dataHora)}${motivo}</span>
                <strong>${moeda(r.valor)}</strong>
              </div>
            </div>
          </div>`;
      })
      .join('');
  }

  // -------------------- EVENTOS --------------------

  function configurarBotoesDaAnalise(): void {
    document.querySelector('#iniciar')?.addEventListener('click', () => {
      executar(
        () => sireq.iniciarAnalise(),
        'Requisição encaminhada para análise.'
      );
    });

    document.querySelector('#cancelar')?.addEventListener('click', () => {
      const motivo = prompt('Motivo do cancelamento:') ?? '';
      executar(() => sireq.cancelarProxima(motivo), 'Requisição cancelada.');
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

          executar(
            () => sireq.decidir(status, motivo),
            'Decisão registrada.'
          );
        });
      });
  }

  tipoSelect.addEventListener('change', renderizarCampos);

  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();

    const formData = new FormData(formulario);
    const tipo = String(formData.get('tipo')) as TipoRequisicao;

    executar(
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
    renderizarCampos();
  });

  document.querySelector('#desfazer')!.addEventListener('click', () => {
    executar(() => sireq.desfazerUltima(), 'Última operação desfeita.');
  });

  document.querySelector('#limpar')!.addEventListener('click', () => {
    if (!confirm('Limpar todos os dados?')) {
      return;
    }

    sireq.limpar();
    renderizar();
    mostrarMensagem('Dados removidos.');
  });

  // Primeira montagem da tela.
  renderizarCampos();
  renderizar();
}
