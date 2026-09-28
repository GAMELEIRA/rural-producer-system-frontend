/**
 * Entidades dos cadastros básicos (diagrama de classes do PTCC).
 * Os nomes dos campos seguem o backend (DTOs em português).
 */

export interface Cultura {
  idCultura: number;
  nome: string;
  tipo: string;
  cicloEstimado: number;
  unidadeCiclo: string;
  observacoes?: string;
}

export interface Talhao {
  idTalhao: number;
  nome: string;
  area: number;
  unidadeArea: string;
  localizacao: string;
  observacoes?: string;
}

export interface Insumo {
  idInsumo: number;
  nome: string;
  tipo: string;
  unidadeMedida: string;
  quantidadeEstoque: number;
  precoUnitario: number;
  observacoes?: string;
}

export interface Produto {
  idProduto: number;
  nome: string;
  unidadeMedida: string;
  precoVenda: number;
  quantidadeEstoque: number;
  observacoes?: string;
}

export const TIPOS_CULTURA = [
  'Grão',
  'Hortaliça',
  'Fruta',
  'Leguminosa',
  'Raiz/Tubérculo',
  'Outro',
];
export const UNIDADES_CICLO = ['dias', 'semanas', 'meses'];
export const UNIDADES_AREA = ['ha', 'm²', 'alqueire'];
export const TIPOS_INSUMO = ['Semente', 'Fertilizante', 'Defensivo', 'Corretivo', 'Outro'];
export const UNIDADES_MEDIDA = ['kg', 'g', 'L', 'mL', 'un', 'sc', 'cx'];
