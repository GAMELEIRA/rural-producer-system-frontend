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
      { label: 'Plantações', icon: '🌾', soon: true },
      { label: 'Aplicação de insumos', icon: '💧', soon: true },
      { label: 'Safras', icon: '📅', soon: true },
      { label: 'Perdas', icon: '⚠️', soon: true },
    ],
  },
  {
    title: 'Comercial',
    items: [
      { label: 'Estoque', icon: '🏬', soon: true },
      { label: 'Vendas', icon: '💰', soon: true },
      { label: 'Resumo financeiro', icon: '📊', soon: true },
    ],
  },
];
