export interface MenuItem {
  label: string;
  icon: string;
  route?: string;
  /** Funcionalidade prevista no backlog, ainda não disponível. */
  soon?: boolean;
}

export interface MenuSection {
  title?: string;
  items: MenuItem[];
}

/** Menu principal baseado no backlog do PTCC (Sistema de Gestão para Microprodutores Rurais). */
export const MENU: MenuSection[] = [
  {
    items: [{ label: 'Início', icon: '🏠', route: '/' }],
  },
  {
    title: 'Cadastros',
    items: [
      { label: 'Culturas', icon: '🌱', route: '/culturas' },
      { label: 'Talhões', icon: '🗺️', route: '/talhoes' },
      { label: 'Insumos', icon: '🧪', route: '/insumos' },
      { label: 'Produtos', icon: '📦', route: '/produtos' },
    ],
  },
  {
    title: 'Produção',
    items: [
      { label: 'Plantações', icon: '🌾', route: '/plantacoes' },
      { label: 'Aplicação de insumos', icon: '💧', route: '/aplicacoes-insumo' },
      { label: 'Safras', icon: '📅', route: '/safras' },
      { label: 'Gastos de produção', icon: '🧾', route: '/gastos' },
      { label: 'Perdas', icon: '⚠️', route: '/perdas' },
    ],
  },
  {
    title: 'Comercial',
    items: [
      { label: 'Estoque', icon: '🏬', soon: true },
      { label: 'Vendas', icon: '💰', soon: true },
      { label: 'Resumo financeiro', icon: '📊', route: '/financeiro' },
    ],
  },
];
