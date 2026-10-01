import type {
  DadosEspecificos,
  OperacaoHistorico,
  Requisicao,
  TipoRequisicao
} from './tipos';
import type { Sireq } from './sireq';

// Este arquivo cuida apenas da interface.
// As regras do sistema continuam em sireq.ts.

const HTML_PRINCIPAL = `
<header>
  <div class="brand">
    <div class="brand-mark">S</div>
    <div>
      <strong>SIREQ</strong>
      <span>Requisições e aprovações</span>
    </div>
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
        <div>
          <h2 id="tituloForm">Nova requisição</h2>
          <p id="subtituloForm">Preencha os dados da solicitação.</p>
        </div>
      </div>

      <form id="form">
        <label>
          Setor
          <input name="setor" required placeholder="Ex.: TI">
        </label>

        <label>
          Requisitante
          <input name="requisitante" required>
        </label>

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

        <label>
          Descrição
          <input name="descricao" required>
        </label>

        <div id="camposEspecificos"></div>

        <label>
          Justificativa <span class="hint">mínimo 20 caracteres</span>
          <textarea name="justificativa" minlength="20" required></textarea>
        </label>

        <button id="botaoForm" type="submit">Cadastrar requisição</button>
      </form>
    </article>

    <article class="card">
      <div class="card-head title-row">
        <div>
          <h2>Análise</h2>
          <p>Próxima solicitação aguardando decisão.</p>
        </div>
        <span class="status-neutral">Pendente</span>
      </div>

      <div id="analise"></div>
    </article>
  </section>

  <section class="card wide">
    <div class="card-head title-row">
      <div>
        <h2>Solicitações pendentes</h2>
        <p>Organizadas por ordem de entrada.</p>
      </div>
      <span id="filaInfo" class="counter"></span>
    </div>

    <div id="fila"></div>
  </section>

  <section class="card wide">
    <div class="card-head title-row">
      <div>
        <h2>Histórico</h2>
        <p>Registro das decisões realizadas.</p>
      </div>
      <button id="desfazer" class="secondary">Desfazer última</button>
    </div>

    <div id="historico"></div>
  </section>
</main>
`;

const CAMPOS_POR_TIPO: Record<TipoRequisicao, string> = {
  MATERIAL: `
    <div class="specific">
      <div class="two">
        <label>Item<input name="item" required></label>
        <label>Quantidade<input name="quantidade" type="number" min="1" required></label>
      </div>
      <label>Valor unitário (R$)<input name="valorUnitario" type="number" min="0" step="0.01" required></label>
    </div>`,

  SERVICO: `
    <div class="specific">
      <label>Fornecedor<input name="fornecedor" required></label>
      <label>Período<input name="periodo" required placeholder="Ex.: 01/10/2026 a 15/10/2026"></label>
    </div>`,

  VIAGEM: `
    <div class="specific">
      <label>Destino<input name="destino" required></label>
      <label>Período<input name="periodo" required placeholder="Ex.: 10/10/2026 a 14/10/2026"></label>
      <label>Finalidade<input name="finalidade" required></label>
    </div>`,

  SOFTWARE: `
    <div class="specific">
      <label>Nome do software<input name="software" required></label>
      <div class="two">
        <label>Licenças<input name="licencas" type="number" min="1" required></label>
        <label>Período<input name="periodo" required placeholder="Ex.: 12 meses"></label>
      </div>
    </div>`,

  OUTROS: `
    <div class="specific">
      <label>Descrição detalhada<textarea name="descricaoDetalhada" required></textarea></label>
    </div>`
};

function moeda(valor: number): string {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

function data(valor: string): string {
  return new Date(valor).toLocaleString('pt-BR');
}

// Evita que um texto digitado no formulário seja interpretado como HTML.
function textoSeguro(valor: unknown): string {
  return String(valor ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function detalhes(requisicao: Requisicao): string {
  const dados = requisicao.dadosEspecificos;
  const linhas: string[] = [];

  if (requisicao.tipo === 'MATERIAL') {
    linhas.push(
      `Item: ${textoSeguro(dados.item || '-')}`,
      `Quantidade: ${textoSeguro(dados.quantidade || '-')}`,
      `Valor unitário: ${moeda(dados.valorUnitario || 0)}`
    );
  }

  if (requisicao.tipo === 'SERVICO') {
    linhas.push(
      `Fornecedor: ${textoSeguro(dados.fornecedor || '-')}`,
      `Período: ${textoSeguro(dados.periodo || '-')}`
    );
  }

  if (requisicao.tipo === 'VIAGEM') {
    linhas.push(
      `Destino: ${textoSeguro(dados.destino || '-')}`,
      `Período: ${textoSeguro(dados.periodo || '-')}`,
      `Finalidade: ${textoSeguro(dados.finalidade || '-')}`
    );
  }

  if (requisicao.tipo === 'SOFTWARE') {
    linhas.push(
      `Software: ${textoSeguro(dados.software || '-')}`,
      `Licenças: ${textoSeguro(dados.licencas || '-')}`,
      `Período: ${textoSeguro(dados.periodo || '-')}`
    );
  }

  if (requisicao.tipo === 'OUTROS') {
    linhas.push(`Detalhes: ${textoSeguro(dados.descricaoDetalhada || '-')}`);
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

export function iniciarTela(sireq: Sireq): void {
  const app = document.querySelector<HTMLDivElement>('#app')!;
  app.innerHTML = HTML_PRINCIPAL;

  const formulario = document.querySelector<HTMLFormElement>('#form')!;
  const tipoSelect = document.querySelector<HTMLSelectElement>('#tipo')!;
  let requisicaoEmCorrecao: Requisicao | null = null;

  function mostrarMensagem(mensagem: string, erro = false): void {
    const elemento = document.querySelector('#mensagem')!;

    elemento.innerHTML =
      `<div class="msg ${erro ? 'erro' : ''}">${textoSeguro(mensagem)}</div>`;

    setTimeout(() => {
      elemento.innerHTML = '';
    }, 3000);
  }

  function executar(acao: () => unknown, mensagem: string): boolean {
    try {
      acao();
      mostrarMensagem(mensagem);
      renderizar();
      return true;
    } catch (erro) {
      mostrarMensagem(
        erro instanceof Error ? erro.message : 'Erro inesperado.',
        true
      );
      return false;
    }
  }

  function renderizarCampos(): void {
    const tipo = tipoSelect.value as TipoRequisicao;
    const campos = document.querySelector<HTMLDivElement>('#camposEspecificos')!;
    campos.innerHTML = CAMPOS_POR_TIPO[tipo];
  }

  function preencherFormulario(requisicao: Requisicao): void {
    requisicaoEmCorrecao = requisicao;

    const preencher = (nome: string, valor: string | number | undefined) => {
      const campo = formulario.elements.namedItem(nome) as
        | HTMLInputElement
        | HTMLTextAreaElement
        | null;

      if (campo) {
        campo.value = valor === undefined ? '' : String(valor);
      }
    };

    preencher('setor', requisicao.setor);
    preencher('requisitante', requisicao.requisitante);
    preencher('valor', requisicao.valor);
    preencher('descricao', requisicao.descricao);
    preencher('justificativa', requisicao.justificativa);

    tipoSelect.value = requisicao.tipo;
    renderizarCampos();

    const dados = requisicao.dadosEspecificos;

    preencher('item', dados.item);
    preencher('quantidade', dados.quantidade);
    preencher('valorUnitario', dados.valorUnitario);
    preencher('fornecedor', dados.fornecedor);
    preencher('periodo', dados.periodo);
    preencher('destino', dados.destino);
    preencher('finalidade', dados.finalidade);
    preencher('software', dados.software);
    preencher('licencas', dados.licencas);
    preencher('descricaoDetalhada', dados.descricaoDetalhada);

    document.querySelector('#tituloForm')!.textContent =
      `Corrigir ${requisicao.id}`;
    document.querySelector('#subtituloForm')!.textContent =
      'Ajuste os dados e reenvie a requisição para o final da fila.';
    document.querySelector<HTMLButtonElement>('#botaoForm')!.textContent =
      'Reenviar requisição';

    formulario.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function encerrarCorrecao(): void {
    requisicaoEmCorrecao = null;
    formulario.reset();
    renderizarCampos();

    document.querySelector('#tituloForm')!.textContent = 'Nova requisição';
    document.querySelector('#subtituloForm')!.textContent =
      'Preencha os dados da solicitação.';
    document.querySelector<HTMLButtonElement>('#botaoForm')!.textContent =
      'Cadastrar requisição';
  }

  function renderizar(): void {
    const pendentes = sireq.pendentes();
    const historico = sireq.historicoCompleto();
    const atual = sireq.atual();

    renderizarResumo(pendentes, historico);
    renderizarFila(pendentes);
    renderizarAnalise(atual ?? sireq.proxima(), Boolean(atual));
    renderizarHistorico(historico);

    // A área de análise é recriada a cada atualização.
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
        (requisicao, indice) => `
          <div class="row">
            <span class="position">#${indice + 1}</span>
            <div>
              <b>${textoSeguro(requisicao.id)}</b>
              <small>
                ${textoSeguro(requisicao.setor)} •
                ${textoSeguro(requisicao.tipo)} •
                ${textoSeguro(requisicao.requisitante)}
              </small>
            </div>
            <strong>${moeda(requisicao.valor)}</strong>
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
      ? `
        <label>
          Motivo (rejeição/devolução)
          <textarea id="motivo"></textarea>
        </label>
        <div class="actions">
          <button data-decisao="APROVADA">Aprovar</button>
          <button data-decisao="DEVOLVIDA" class="warning">Devolver</button>
          <button data-decisao="REJEITADA" class="danger">Rejeitar</button>
        </div>`
      : `
        <div class="actions">
          <button id="iniciar">Iniciar análise</button>
          <button id="cancelar" class="danger ghost">Cancelar próxima</button>
        </div>`;

    elemento.innerHTML = `
      <div class="focus">
        <small>${emAnalise ? 'EM ANÁLISE' : 'PRÓXIMA DA FILA'}</small>
        <h3>${textoSeguro(requisicao.descricao)}</h3>

        <p>
          <b>${textoSeguro(requisicao.id)}</b> •
          ${textoSeguro(requisicao.setor)} •
          ${textoSeguro(requisicao.requisitante)}
        </p>

        <p>${textoSeguro(requisicao.justificativa)}</p>

        <div class="detail-list">
          ${detalhes(requisicao)}
        </div>

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
        const requisicao = operacao.requisicaoAnterior;

        const motivo = operacao.motivo
          ? ` • Motivo: ${textoSeguro(operacao.motivo)}`
          : '';

        return `
          <div class="history-row">
            <div class="history-top">
              <div>
                <b>
                  ${textoSeguro(operacao.requisicaoId)} ·
                  ${textoSeguro(operacao.acao)}
                </b>

                <small>
                  ${textoSeguro(requisicao.setor)} •
                  ${textoSeguro(requisicao.tipo)} •
                  ${textoSeguro(requisicao.requisitante)}
                </small>
              </div>

              <span class="badge">
                ${textoSeguro(operacao.novoStatus)}
              </span>
            </div>

            <div class="history-body">
              <span>
                <b>Descrição:</b> ${textoSeguro(requisicao.descricao)}
              </span>

              <span>
                <b>Justificativa:</b> ${textoSeguro(requisicao.justificativa)}
              </span>

              <div class="detail-list">
                ${detalhes(requisicao)}
              </div>

              <div class="meta">
                <span>
                  Decisão em ${data(operacao.dataHora)}${motivo}
                </span>
                <strong>${moeda(requisicao.valor)}</strong>
              </div>

              ${
                operacao.novoStatus === 'DEVOLVIDA' &&
                sireq.podeReenviar(operacao.requisicaoId)
                  ? `<div class="actions">
                       <button
                         class="secondary"
                         data-corrigir="${textoSeguro(operacao.requisicaoId)}"
                       >
                         Corrigir e reenviar
                       </button>
                     </div>`
                  : ''
              }
            </div>
          </div>`;
      })
      .join('');
  }

  function configurarBotoesDaAnalise(): void {
    document.querySelector('#iniciar')?.addEventListener('click', () => {
      executar(
        () => sireq.iniciarAnalise(),
        'Requisição encaminhada para análise.'
      );
    });

    document.querySelector('#cancelar')?.addEventListener('click', () => {
      const motivo = prompt('Motivo do cancelamento:') ?? '';

      executar(
        () => sireq.cancelarProxima(motivo),
        'Requisição cancelada.'
      );
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

    document
      .querySelectorAll<HTMLButtonElement>('[data-corrigir]')
      .forEach((botao) => {
        botao.addEventListener('click', () => {
          const id = botao.dataset.corrigir!;
          const operacao = sireq
            .historicoCompleto()
            .find(
              (item) =>
                item.requisicaoId === id &&
                item.novoStatus === 'DEVOLVIDA'
            );

          if (operacao) {
            preencherFormulario(operacao.requisicaoAnterior);
          }
        });
      });
  }

  tipoSelect.addEventListener('change', renderizarCampos);

  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();

    const formData = new FormData(formulario);
    const tipo = String(formData.get('tipo')) as TipoRequisicao;

    const dados = {
      setor: String(formData.get('setor')),
      requisitante: String(formData.get('requisitante')),
      tipo,
      descricao: String(formData.get('descricao')),
      justificativa: String(formData.get('justificativa')),
      valor: Number(formData.get('valor')),
      dadosEspecificos: lerDadosEspecificos(formData)
    };

    const sucesso = requisicaoEmCorrecao
      ? executar(
          () => sireq.reenviar(requisicaoEmCorrecao!.id, dados),
          'Requisição corrigida e reenviada para o final da fila.'
        )
      : executar(
          () => sireq.cadastrar(dados),
          'Requisição cadastrada.'
        );

    if (sucesso) {
      encerrarCorrecao();
    }
  });

  document.querySelector('#desfazer')!.addEventListener('click', () => {
    executar(
      () => sireq.desfazerUltima(),
      'Última operação desfeita.'
    );
  });

  document.querySelector('#limpar')!.addEventListener('click', () => {
    if (!confirm('Limpar todos os dados?')) {
      return;
    }

    sireq.limpar();
    renderizar();
    mostrarMensagem('Dados removidos.');
  });

  renderizarCampos();
  renderizar();
}
