/** Catálogo ilustrativo opcional (Twemoji CC BY 4.0).
 * O código identifica uma imagem do catálogo; imagens próprias são armazenadas em campo separado.
 */
export interface ImagemCatalogo { codigo: string; nome: string; grupo: string; icone: string; url: string; }
const cdn = 'https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/svg/';
const emojiCode = (emoji: string) => [...emoji].map(c => c.codePointAt(0)?.toString(16)).filter(Boolean).join('-');
const grupo = (nomeGrupo: string, itens: ReadonlyArray<[string,string,string]>): ImagemCatalogo[] =>
  itens.map(([codigo,nome,icone]) => ({codigo,nome,grupo:nomeGrupo,icone,url:cdn+emojiCode(icone)+'.svg'}));

export const IMAGENS_CULTURAS: readonly ImagemCatalogo[] = [
  ...grupo('Hortaliças folhosas', [
    ['ALFACE','Alface','🥬'], ['COUVE','Couve','🥬'], ['ESPINAFRE','Espinafre','🌿'],
    ['RUCULA','Rúcula','🌱'], ['AGRIAO','Agrião','🌿'], ['REPOLHO','Repolho','🥬'],
    ['ACELGA','Acelga','🥬'], ['CHICORIA','Chicória','🌿'], ['ESCAROLA','Escarola','🥬'],
    ['ALMEIRAO','Almeirão','🌱']
  ]),
  ...grupo('Legumes, raízes e tubérculos', [
    ['CENOURA','Cenoura','🥕'], ['BETERRABA','Beterraba','🫜'], ['BATATA','Batata','🥔'],
    ['BATATA_DOCE','Batata-doce','🍠'], ['MANDIOCA','Mandioca','🫜'], ['RABANETE','Rabanete','🫜'],
    ['ABOBRINHA','Abobrinha','🥒'], ['PEPINO','Pepino','🥒'], ['BERINJELA','Berinjela','🍆'],
    ['CHUCHU','Chuchu','🌱']
  ]),
  ...grupo('Frutas e hortaliças-fruto', [
    ['TOMATE','Tomate','🍅'], ['ABOBORA','Abóbora','🎃'], ['PIMENTAO','Pimentão','🫑'],
    ['PIMENTA','Pimenta','🌶️'], ['MORANGO','Morango','🍓'], ['BANANA','Banana','🍌'],
    ['LARANJA','Laranja','🍊'], ['MANGA','Manga','🥭'], ['UVA','Uva','🍇'],
    ['MELANCIA','Melancia','🍉']
  ]),
  ...grupo('Grãos, cereais e leguminosas', [
    ['MILHO','Milho','🌽'], ['FEIJAO','Feijão','🫘'], ['ARROZ','Arroz','🌾'],
    ['SOJA','Soja','🌱'], ['TRIGO','Trigo','🌾'], ['ERVILHA','Ervilha','🫛'],
    ['GRAO_DE_BICO','Grão-de-bico','🫘'], ['LENTILHA','Lentilha','🫘'],
    ['AMENDOIM','Amendoim','🥜'], ['GIRASSOL','Girassol','🌻']
  ])
];
export const IMAGENS_INSUMOS: readonly ImagemCatalogo[] = [
  ...grupo('Sementes e mudas', [
    ['SEMENTES','Sementes','🌱'],['MUDAS','Mudas','🪴'],['BULBOS','Bulbos','🧅'],
    ['TUBERCULOS','Tubérculos de plantio','🥔'],['BANDEJAS','Bandejas','🌿']
  ]),
  ...grupo('Solo e nutrição', [
    ['FERTILIZANTE','Fertilizante','🧪'],['ADUBO','Adubo orgânico','🌿'],
    ['COMPOSTO','Composto','🍂'],['CALCARIO','Calcário','🪨'],
    ['SUBSTRATO','Substrato','🪴'],['HUMUS','Húmus','🌱']
  ]),
  ...grupo('Proteção e manejo', [
    ['DEFENSIVO','Defensivo','🧴'], ['BIOINSUMO','Bioinsumo','🦠'],
    ['ARMADILHA','Armadilha','🪤'],['IRRIGACAO','Água de irrigação','💧'],
    ['EQUIPAMENTO','Equipamentos','🔧'],['EMBALAGEM','Embalagem','📦']
  ])
];
export const imagemPorCodigo = (itens: readonly ImagemCatalogo[], codigo?: string | null) =>
  itens.find(i => i.codigo === codigo)?.url ?? null;
export const imagemDoCadastro = (
  itens: readonly ImagemCatalogo[], codigo?: string | null, personalizada?: string | null
) => personalizada || imagemPorCodigo(itens,codigo);
