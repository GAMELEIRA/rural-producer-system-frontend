/** Galeria ilustrativa opcional. Persistimos somente o codigo, nunca uma URL informada pelo usuario.
 * Ilustrações Twemoji (CC BY 4.0): https://github.com/jdecked/twemoji
 */
export interface ImagemCatalogo { codigo: string; nome: string; icone: string; url: string; }
const url = (codigo: string) => `https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/svg/${codigo}.svg`;
const item = (codigo: string, nome: string, icone: string, unicode: string): ImagemCatalogo =>
  ({ codigo, nome, icone, url: url(unicode) });

export const IMAGENS_CULTURAS: readonly ImagemCatalogo[] = [
  item('CENOURA','Cenoura','🥕','1f955'),
  item('MILHO','Milho','🌽','1f33d'),
  item('TOMATE','Tomate','🍅','1f345'),
  item('BATATA','Batata','🥔','1f954'),
  item('ALFACE','Alface','🥬','1f96c'),
  item('CEBOLA','Cebola','🧅','1f9c5'),
  item('FEIJAO','Feijão / leguminosas','🫘','1fad8'),
  item('ARROZ','Arroz','🌾','1f33e'),
  item('SOJA','Soja / broto','🌱','1f331'),
  item('ABOBORA','Abóbora','🎃','1f383'),
  item('MORANGO','Morango','🍓','1f353'),
  item('BANANA','Banana','🍌','1f34c'),
  item('UVA','Uva','🍇','1f347'),
  item('LARANJA','Laranja','🍊','1f34a'),
  item('MACA','Maçã','🍎','1f34e')
];
export const IMAGENS_INSUMOS: readonly ImagemCatalogo[] = [
  item('SEMENTES','Sementes','🌱','1f331'),
  item('FERTILIZANTE','Fertilizante','🧪','1f9ea'),
  item('DEFENSIVO','Defensivo','🧴','1f9f4'),
  item('ADUBO','Adubo orgânico','🌿','1f33f'),
  item('CALCARIO','Corretivo do solo','🪨','1faa8'),
  item('IRRIGACAO','Água / irrigação','💧','1f4a7'),
  item('FERRAMENTA','Ferramentas','🔧','1f527'),
  item('OUTRO','Outros insumos','📦','1f4e6')
];
export const imagemPorCodigo = (itens: readonly ImagemCatalogo[], codigo?: string | null) =>
  itens.find(item => item.codigo === codigo)?.url ?? null;
