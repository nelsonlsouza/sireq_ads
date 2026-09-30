export const templatePrincipal = `
<header><div class="brand"><div class="brand-mark">S</div><div><strong>SIREQ</strong><span>Requisições e aprovações</span></div></div><button id="limpar" class="text-button">Limpar dados</button></header>
<main>
<section class="page-head"><div><span class="section-label">Visão geral</span><h1>Requisições</h1><p>Acompanhe solicitações, análises e decisões em um só lugar.</p></div><div class="stats"><article><span>Pendentes</span><b id="qtd">0</b></article><article><span>Finalizadas</span><b id="histQtd">0</b></article></div></section>
<div id="mensagem"></div>
<section class="grid"><article class="card"><div class="card-head"><div><h2>Nova requisição</h2><p>Preencha os dados da solicitação.</p></div></div><form id="form">
<label>Setor<input name="setor" required placeholder="Ex.: TI"></label><label>Requisitante<input name="requisitante" required></label>
<div class="two"><label>Tipo<select name="tipo" id="tipo"><option value="MATERIAL">Material</option><option value="SERVICO">Serviço</option><option value="VIAGEM">Viagem</option><option value="SOFTWARE">Software</option><option value="OUTROS">Outros</option></select></label><label>Valor estimado (R$)<input name="valor" type="number" min="0" step="0.01" required></label></div>
<label>Descrição<input name="descricao" required></label><div id="camposEspecificos"></div><label>Justificativa <span class="hint">mínimo 20 caracteres</span><textarea name="justificativa" minlength="20" required></textarea></label><button type="submit">Cadastrar requisição</button></form></article>
<article class="card"><div class="card-head title-row"><div><h2>Análise</h2><p>Próxima solicitação aguardando decisão.</p></div><span class="status-neutral">Pendente</span></div><div id="analise"></div></article></section>
<section class="card wide"><div class="card-head title-row"><div><h2>Solicitações pendentes</h2><p>Organizadas por ordem de entrada.</p></div><span id="filaInfo" class="counter"></span></div><div id="fila"></div></section>
<section class="card wide"><div class="card-head title-row"><div><h2>Histórico</h2><p>Registro das decisões realizadas.</p></div><button id="desfazer" class="secondary">Desfazer última</button></div><div id="historico"></div></section>
</main>`;
