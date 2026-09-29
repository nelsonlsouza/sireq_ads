import './style.css';
import { SireqService } from './services/SireqService';
import type { TipoRequisicao } from './models/Requisicao';

const sireq = new SireqService();
const app = document.querySelector<HTMLDivElement>('#app')!;

app.innerHTML = `
<header><div><strong>SIREQ</strong><span>Sistema Inteligente de Requisições e Aprovações</span></div><button id="limpar" class="ghost">Limpar dados</button></header>
<main>
<section class="hero"><div><p class="eyebrow">MVP acadêmico • FIFO + LIFO</p><h1>Controle de requisições simples e rastreável.</h1><p>Cadastre despesas, respeite a ordem de chegada e registre cada decisão.</p></div><div class="stats"><article><b id="qtd">0</b><span>Pendentes</span></article><article><b id="histQtd">0</b><span>Decisões</span></article></div></section>
<div id="mensagem"></div>
<section class="grid"><article class="card"><h2>Nova requisição</h2><form id="form">
<label>Setor<input name="setor" required placeholder="Ex.: TI"></label><label>Requisitante<input name="requisitante" required></label>
<div class="two"><label>Tipo<select name="tipo"><option>MATERIAL</option><option>SERVICO</option><option>VIAGEM</option><option>SOFTWARE</option><option>OUTROS</option></select></label><label>Valor (R$)<input name="valor" type="number" min="0" step="0.01" required></label></div>
<label>Descrição<input name="descricao" required></label><label>Justificativa<textarea name="justificativa" required></textarea></label><button type="submit">Cadastrar e enfileirar</button></form></article>
<article class="card"><div class="title-row"><h2>Próxima análise</h2><span class="badge">FIFO</span></div><div id="analise"></div></article></section>
<section class="card wide"><div class="title-row"><h2>Fila de análise</h2><span id="filaInfo"></span></div><div id="fila"></div></section>
<section class="card wide"><div class="title-row"><h2>Histórico</h2><button id="desfazer" class="ghost">Desfazer última</button></div><div id="historico"></div></section>
</main>`;

const msg=(texto:string,erro=false)=>{const el=document.querySelector('#mensagem')!;el.innerHTML=`<div class="msg ${erro?'erro':''}">${texto}</div>`;setTimeout(()=>el.innerHTML='',3000)};
const moeda=(v:number)=>v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const data=(v:string)=>new Date(v).toLocaleString('pt-BR');
function acao(fn:()=>unknown,sucesso:string){try{fn();msg(sucesso);render()}catch(e){msg(e instanceof Error?e.message:'Erro inesperado.',true)}}

function render(){
 const pend=sireq.pendentes(),hist=sireq.historicoCompleto(),atual=sireq.atual();
 document.querySelector('#qtd')!.textContent=String(pend.length);document.querySelector('#histQtd')!.textContent=String(hist.length);document.querySelector('#filaInfo')!.textContent=`${pend.length} aguardando`;
 document.querySelector('#fila')!.innerHTML=pend.length?pend.map((r,i)=>`<div class="row"><span class="position">#${i+1}</span><div><b>${r.id}</b><small>${r.setor} • ${r.tipo} • ${r.requisitante}</small></div><strong>${moeda(r.valor)}</strong></div>`).join(''):'<p class="empty">Nenhuma requisição pendente.</p>';
 const alvo=atual??sireq.proxima();
 document.querySelector('#analise')!.innerHTML=alvo?`<div class="focus"><small>${atual?'EM ANÁLISE':'PRÓXIMA DA FILA'}</small><h3>${alvo.descricao}</h3><p><b>${alvo.id}</b> • ${alvo.setor} • ${alvo.requisitante}</p><p>${alvo.justificativa}</p><strong>${moeda(alvo.valor)}</strong></div>${atual?`<label>Motivo (rejeição/devolução)<textarea id="motivo"></textarea></label><div class="actions"><button data-decisao="APROVADA">Aprovar</button><button data-decisao="DEVOLVIDA" class="warning">Devolver</button><button data-decisao="REJEITADA" class="danger">Rejeitar</button></div>`:`<div class="actions"><button id="iniciar">Iniciar análise</button><button id="cancelar" class="danger ghost">Cancelar próxima</button></div>`}`:'<p class="empty">A fila está vazia.</p>';
 document.querySelector('#historico')!.innerHTML=hist.length?hist.map(h=>`<div class="row"><div><b>${h.acao}</b><small>${h.requisicaoId} • ${data(h.dataHora)}${h.motivo?' • '+h.motivo:''}</small></div><span class="badge">${h.novoStatus}</span></div>`).join(''):'<p class="empty">Nenhuma decisão registrada.</p>';
 document.querySelector('#iniciar')?.addEventListener('click',()=>acao(()=>sireq.iniciarAnalise(),'Requisição encaminhada para análise.'));
 document.querySelector('#cancelar')?.addEventListener('click',()=>acao(()=>sireq.cancelarProxima(prompt('Motivo do cancelamento:')??''),'Requisição cancelada.'));
 document.querySelectorAll<HTMLButtonElement>('[data-decisao]').forEach(b=>b.addEventListener('click',()=>acao(()=>sireq.decidir(b.dataset.decisao as 'APROVADA'|'REJEITADA'|'DEVOLVIDA',document.querySelector<HTMLTextAreaElement>('#motivo')?.value??''),'Decisão registrada.')));
}
document.querySelector<HTMLFormElement>('#form')!.addEventListener('submit',(e)=>{e.preventDefault();const form=e.currentTarget as HTMLFormElement;const f=new FormData(form);acao(()=>sireq.cadastrar({setor:String(f.get('setor')),requisitante:String(f.get('requisitante')),tipo:String(f.get('tipo')) as TipoRequisicao,descricao:String(f.get('descricao')),justificativa:String(f.get('justificativa')),valor:Number(f.get('valor'))}),'Requisição cadastrada no final da fila.');form.reset();});
document.querySelector('#desfazer')!.addEventListener('click',()=>acao(()=>sireq.desfazerUltima(),'Última operação desfeita.'));
document.querySelector('#limpar')!.addEventListener('click',()=>{if(confirm('Limpar todos os dados?')){sireq.limpar();render();msg('Dados removidos.')}});
render();