import { Plantacao } from './producao.service';

/** Data YYYY-MM-DD do backend: não usar Date para evitar deslocamento de fuso horário. */
function dataLocal(data?: string | null): string {
  if (!data) return 'data não informada';
  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(data);
  return partes ? `${partes[3]}/${partes[2]}/${partes[1]}` : data;
}

/**
 * Identificação estável para seletores de plantação.
 * ID é único mesmo que cultura, talhão e data coincidam.
 */
export function rotuloPlantacao(plantacao: Plantacao): string {
  return `#${plantacao.idPlantacao} · ${plantacao.nomeCultura} · ${dataLocal(plantacao.dataPlantio)} · ${plantacao.nomeTalhao}`;
}

/** Informações adicionais para conferir a seleção antes de um lançamento. */
export function descricaoPlantacao(plantacao: Plantacao): string {
  return `Plantação #${plantacao.idPlantacao} · Cultura: ${plantacao.nomeCultura} · Talhão: ${plantacao.nomeTalhao} · Plantio: ${dataLocal(plantacao.dataPlantio)} · Safra: ${plantacao.nomeSafra || 'não informada'}`;
}
