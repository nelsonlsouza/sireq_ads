import type { DadosEspecificos, TipoRequisicao } from '../models/Requisicao';

const camposPorTipo: Record<TipoRequisicao, string> = {
  MATERIAL: '<div class="specific"><div class="two"><label>Item<input name="item" required></label><label>Quantidade<input name="quantidade" type="number" min="1" required></label></div><label>Valor unitário (R$)<input name="valorUnitario" type="number" min="0" step="0.01" required></label></div>',
  SERVICO: '<div class="specific"><label>Fornecedor<input name="fornecedor" required></label><label>Período<input name="periodo" required placeholder="Ex.: 01/10/2026 a 15/10/2026"></label></div>',
  VIAGEM: '<div class="specific"><label>Destino<input name="destino" required></label><label>Período<input name="periodo" required placeholder="Ex.: 10/10/2026 a 14/10/2026"></label><label>Finalidade<input name="finalidade" required></label></div>',
  SOFTWARE: '<div class="specific"><label>Nome do software<input name="software" required></label><div class="two"><label>Licenças<input name="licencas" type="number" min="1" required></label><label>Período<input name="periodo" required placeholder="Ex.: 12 meses"></label></div></div>',
  OUTROS: '<div class="specific"><label>Descrição detalhada<textarea name="descricaoDetalhada" required></textarea></label></div>'
};

export function renderizarCamposEspecificos(tipo: TipoRequisicao): void {
  const container = document.querySelector<HTMLDivElement>('#camposEspecificos')!;
  container.innerHTML = camposPorTipo[tipo];
}

export function lerDadosEspecificos(formData: FormData): DadosEspecificos {
  return {
    item: String(formData.get('item') ?? ''),
    quantidade: Number(formData.get('quantidade') || 0),
    valorUnitario: Number(formData.get('valorUnitario') || 0),
    fornecedor: String(formData.get('fornecedor') ?? ''),
    periodo: String(formData.get('periodo') ?? ''),
    destino: String(formData.get('destino') ?? ''),
    finalidade: String(formData.get('finalidade') ?? ''),
    software: String(formData.get('software') ?? ''),
    licencas: Number(formData.get('licencas') || 0),
    descricaoDetalhada: String(formData.get('descricaoDetalhada') ?? '')
  };
}
