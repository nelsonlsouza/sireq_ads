import './style.css';
import { SireqService } from './services/SireqService';
import type { TipoRequisicao } from './models/Requisicao';

const sireq = new SireqService();
const app = document.querySelector<HTMLDivElement>('#app')!;

app.innerHTML = `
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

const msg=(texto:string,erro=false)=>{const el=document.querySelector('#mensagem')!;el.innerHTML=`<div class="msg ${erro?'erro':''}">${texto}</div>`;setTimeout(()=>el.innerHTML='',3000)};
const moeda=(v:number)=>v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const data=(v:string)=>new Date(v).toLocaleString('pt-BR');
const detalhes=(r: import('./models/Requisicao').Requisicao)=>{
 const e=r.dadosEspecificos??{}; const linhas:string[]=[];
 if(r.tipo==='MATERIAL') linhas.push(`Item: ${e.item||'-'}`,`Quantidade: ${e.quantidade||'-'}`,`Valor unitário: ${moeda(e.valorUnitario||0)}`);
 if(r.tipo==='SERVICO') linhas.push(`Fornecedor: ${e.fornecedor||'-'}`,`Período: ${e.periodo||'-'}`);
 if(r.tipo==='VIAGEM') linhas.push(`Destino: ${e.destino||'-'}`,`Período: ${e.periodo||'-'}`,`Finalidade: ${e.finalidade||'-'}`);
 if(r.tipo==='SOFTWARE') linhas.push(`Software: ${e.software||'-'}`,`Licenças: ${e.licencas||'-'}`,`Período: ${e.periodo||'-'}`);
 if(r.tipo==='OUTROS') linhas.push(`Detalhes: ${e.descricaoDetalhada||'-'}`);
 return linhas.map(x=>`<span>${x}</span>`).join('');
};
function acao(fn:()=>unknown,sucesso:string){try{fn();msg(sucesso);render()}catch(e){msg(e instanceof Error?e.message:'Erro inesperado.',true)}}

function render(){
 const pend=sireq.pendentes(),hist=sireq.historicoCompleto(),atual=sireq.atual();
 document.querySelector('#qtd')!.textContent=String(pend.length);document.querySelector('#histQtd')!.textContent=String(hist.length);document.querySelector('#filaInfo')!.textContent=`${pend.length} aguardando`;
 document.querySelector('#fila')!.innerHTML=pend.length?pend.map((r,i)=>`<div class="row"><span class="position">#${i+1}</span><div><b>${r.id}</b><small>${r.setor} • ${r.tipo} • ${r.requisitante}</small></div><strong>${moeda(r.valor)}</strong></div>`).join(''):'<p class="empty">Nenhuma requisição pendente.</p>';
 const alvo=atual??sireq.proxima();
 document.querySelector('#analise')!.innerHTML=alvo?`<div class="focus"><small>${atual?'EM ANÁLISE':'PRÓXIMA DA FILA'}</small><h3>${alvo.descricao}</h3><p><b>${alvo.id}</b> • ${alvo.setor} • ${alvo.requisitante}</p><p>${alvo.justificativa}</p><div class="detail-list">${detalhes(alvo)}</div><div class="meta"><span>Cadastrada em ${data(alvo.criadoEm)}</span><strong>${moeda(alvo.valor)}</strong></div></div>${atual?`<label>Motivo (rejeição/devolução)<textarea id="motivo"></textarea></label><div class="actions"><button data-decisao="APROVADA">Aprovar</button><button data-decisao="DEVOLVIDA" class="warning">Devolver</button><button data-decisao="REJEITADA" class="danger">Rejeitar</button></div>`:`<div class="actions"><button id="iniciar">Iniciar análise</button><button id="cancelar" class="danger ghost">Cancelar próxima</button></div>`}`:'<p class="empty">A fila está vazia.</p>';
 document.querySelector('#historico')!.innerHTML=hist.length?hist.map(h=>`<div class="history-row"><div class="history-top"><div><b>${h.requisicaoId} · ${h.acao}</b><small>${h.requisicaoAnterior.setor} • ${h.requisicaoAnterior.tipo} • ${h.requisicaoAnterior.requisitante}</small></div><span class="badge">${h.novoStatus}</span></div><div class="history-body"><span><b>Descrição:</b> ${h.requisicaoAnterior.descricao}</span><span><b>Justificativa:</b> ${h.requisicaoAnterior.justificativa}</span><div class="detail-list">${detalhes(h.requisicaoAnterior)}</div><div class="meta"><span>Decisão em ${data(h.dataHora)}${h.motivo?' • Motivo: '+h.motivo:''}</span><strong>${moeda(h.requisicaoAnterior.valor)}</strong></div></div></div>`).join(''):'<p class="empty">Nenhuma decisão registrada.</p>';
 document.querySelector('#iniciar')?.addEventListener('click',()=>acao(()=>sireq.iniciarAnalise(),'Requisição encaminhada para análise.'));
 document.querySelector('#cancelar')?.addEventListener('click',()=>acao(()=>sireq.cancelarProxima(prompt('Motivo do cancelamento:')??''),'Requisição cancelada.'));
 document.querySelectorAll<HTMLButtonElement>('[data-decisao]').forEach(b=>b.addEventListener('click',()=>acao(()=>sireq.decidir(b.dataset.decisao as 'APROVADA'|'REJEITADA'|'DEVOLVIDA',document.querySelector<HTMLTextAreaElement>('#motivo')?.value??''),'Decisão registrada.')));
}
const tipoSelect = document.querySelector<HTMLSelectElement>('#tipo')!;
const camposEspecificos = document.querySelector<HTMLDivElement>('#camposEspecificos')!;

function renderCamposEspecificos() {
  const tipo = tipoSelect.value as TipoRequisicao;
  const campos: Record<TipoRequisicao, string> = {
    MATERIAL: '<div class="specific"><div class="two"><label>Item<input name="item" required></label><label>Quantidade<input name="quantidade" type="number" min="1" required></label></div><label>Valor unitário (R$)<input name="valorUnitario" type="number" min="0" step="0.01" required></label></div>',
    SERVICO: '<div class="specific"><label>Fornecedor<input name="fornecedor" required></label><label>Período<input name="periodo" required placeholder="Ex.: 01/10/2026 a 15/10/2026"></label></div>',
    VIAGEM: '<div class="specific"><label>Destino<input name="destino" required></label><label>Período<input name="periodo" required placeholder="Ex.: 10/10/2026 a 14/10/2026"></label><label>Finalidade<input name="finalidade" required></label></div>',
    SOFTWARE: '<div class="specific"><label>Nome do software<input name="software" required></label><div class="two"><label>Licenças<input name="licencas" type="number" min="1" required></label><label>Período<input name="periodo" required placeholder="Ex.: 12 meses"></label></div></div>',
    OUTROS: '<div class="specific"><label>Descrição detalhada<textarea name="descricaoDetalhada" required></textarea></label></div>'
  };
  camposEspecificos.innerHTML = campos[tipo];
}
tipoSelect.addEventListener('change', renderCamposEspecificos);
renderCamposEspecificos();

document.querySelector<HTMLFormElement>('#form')!.addEventListener('submit',(e)=>{
  e.preventDefault();
  const form=e.currentTarget as HTMLFormElement;
  const f=new FormData(form);
  const tipo=String(f.get('tipo')) as TipoRequisicao;
  const dadosEspecificos={
    item:String(f.get('item')??''), quantidade:Number(f.get('quantidade')||0), valorUnitario:Number(f.get('valorUnitario')||0),
    fornecedor:String(f.get('fornecedor')??''), periodo:String(f.get('periodo')??''), destino:String(f.get('destino')??''),
    finalidade:String(f.get('finalidade')??''), software:String(f.get('software')??''), licencas:Number(f.get('licencas')||0),
    descricaoDetalhada:String(f.get('descricaoDetalhada')??'')
  };
  acao(()=>sireq.cadastrar({setor:String(f.get('setor')),requisitante:String(f.get('requisitante')),tipo,descricao:String(f.get('descricao')),justificativa:String(f.get('justificativa')),valor:Number(f.get('valor')),dadosEspecificos}),'Requisição cadastrada.');
  form.reset(); renderCamposEspecificos();
});
document.querySelector('#desfazer')!.addEventListener('click',()=>acao(()=>sireq.desfazerUltima(),'Última operação desfeita.'));
document.querySelector('#limpar')!.addEventListener('click',()=>{if(confirm('Limpar todos os dados?')){sireq.limpar();render();msg('Dados removidos.')}});
render();