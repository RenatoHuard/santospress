export type MenuNode = {
  id: string
  label: string
  parentId: string | null
  isGroup: boolean
}

export const MENU_NODES: MenuNode[] = [
  { id: 'meus-dados',   label: 'Meus Dados',     parentId: null,          isGroup: true  },
  { id: 'visualizar',   label: 'Visualizar',      parentId: 'meus-dados',  isGroup: false },
  { id: 'atualizar',    label: 'Atualizar Dados', parentId: 'meus-dados',  isGroup: false },
  { id: 'kanban',       label: 'Kanban',          parentId: null,          isGroup: true  },
  { id: 'calendario',   label: 'Calendário',      parentId: 'kanban',      isGroup: false },
  { id: 'gestao',       label: 'Gestão',          parentId: 'kanban',      isGroup: false },
  { id: 'cadastros',       label: 'Cadastros',          parentId: null,          isGroup: true  },
  { id: 'funcionarios',    label: 'Colaboradores',       parentId: 'cadastros',   isGroup: false },
  { id: 'clientes',        label: 'Clientes',            parentId: 'cadastros',   isGroup: false },
  { id: 'usuarios-sistema', label: 'Usuários do Sistema', parentId: 'cadastros',  isGroup: false },
  { id: 'site',              label: 'Site',            parentId: null,          isGroup: true  },
  { id: 'editar-site',      label: 'Editar Site',     parentId: 'site',        isGroup: false },
  { id: 'relatorios-site',  label: 'Relatórios Site', parentId: 'site',        isGroup: false },
  { id: 'noticias',          label: 'Notícias',    parentId: 'site',    isGroup: true  },
  { id: 'nova-noticia',      label: 'Nova Notícia', parentId: 'noticias', isGroup: false },
  { id: 'publicacoes',       label: 'Publicações',  parentId: 'noticias', isGroup: false },
  { id: 'rascunhos',         label: 'Rascunhos',    parentId: 'noticias', isGroup: false },
  { id: 'relatorios',        label: 'Relatórios',   parentId: 'noticias', isGroup: false },
  { id: 'cases',             label: 'Post Cases',   parentId: 'site',    isGroup: true  },
  { id: 'nova-case',         label: 'Nova Case',    parentId: 'cases',   isGroup: false },
  { id: 'publicacoes-cases', label: 'Publicações',  parentId: 'cases',   isGroup: false },
  { id: 'rascunhos-cases',   label: 'Rascunhos',    parentId: 'cases',   isGroup: false },
  { id: 'relatorios-cases',  label: 'Relatórios',   parentId: 'cases',   isGroup: false },
  { id: 'blog',              label: 'Blog',         parentId: 'site',    isGroup: true  },
  { id: 'nova-blog',         label: 'Novo Post',    parentId: 'blog',    isGroup: false },
  { id: 'publicacoes-blog',  label: 'Publicações',  parentId: 'blog',    isGroup: false },
  { id: 'rascunhos-blog',    label: 'Rascunhos',    parentId: 'blog',    isGroup: false },
  { id: 'relatorios-blog',   label: 'Relatórios',   parentId: 'blog',    isGroup: false },
  { id: 'imprensa',               label: 'Imprensa',       parentId: null,       isGroup: true  },
  { id: 'imprensa-dashboard',     label: 'Painel',         parentId: 'imprensa', isGroup: false },
  { id: 'imprensa-mailing',       label: 'Mailing',        parentId: 'imprensa', isGroup: false },
  { id: 'imprensa-jornalistas',   label: 'Jornalistas',    parentId: 'imprensa', isGroup: false },
  { id: 'imprensa-veiculos',      label: 'Veículos',       parentId: 'imprensa', isGroup: false },
  { id: 'imprensa-releases',      label: 'Releases',       parentId: 'imprensa', isGroup: false },
  { id: 'imprensa-clipping',      label: 'Clipping',       parentId: 'imprensa', isGroup: false },
  { id: 'imprensa-metas',         label: 'Metas',          parentId: 'imprensa', isGroup: false },
  { id: 'imprensa-ranking',       label: 'Ranking',        parentId: 'imprensa', isGroup: false },
  { id: 'imprensa-alertas',       label: 'Alertas',        parentId: 'imprensa', isGroup: false },
  { id: 'imprensa-config',        label: 'Configurações',  parentId: 'imprensa', isGroup: false },
  { id: 'imprensa-importar',      label: 'Importar',       parentId: 'imprensa', isGroup: false },
]

export const CONFIGURABLE_ROLES = [
  { key: 'gestor',      label: 'Gestor',      color: 'blue'   },
  { key: 'rh',          label: 'RH',          color: 'purple' },
  { key: 'colaborador', label: 'Colaborador', color: 'green'  },
  { key: 'atendente',   label: 'Atendente',   color: 'orange' },
] as const

const IMPRENSA_BASE = ['imprensa','imprensa-dashboard','imprensa-mailing','imprensa-jornalistas','imprensa-veiculos','imprensa-releases','imprensa-clipping','imprensa-metas','imprensa-ranking','imprensa-alertas']
const IMPRENSA_ADMIN = [...IMPRENSA_BASE, 'imprensa-config', 'imprensa-importar']
const IMPRENSA_COLAB = ['imprensa','imprensa-dashboard','imprensa-mailing','imprensa-jornalistas','imprensa-veiculos','imprensa-releases','imprensa-clipping','imprensa-ranking','imprensa-alertas']

export const DEFAULT_PERMISSIONS: Record<string, string[]> = {
  gestor:      ['meus-dados','visualizar','atualizar','kanban','calendario','gestao','cadastros','funcionarios','clientes','usuarios-sistema','site','editar-site','relatorios-site','noticias','nova-noticia','publicacoes','rascunhos','relatorios','cases','nova-case','publicacoes-cases','rascunhos-cases','relatorios-cases','blog','nova-blog','publicacoes-blog','rascunhos-blog','relatorios-blog',...IMPRENSA_ADMIN],
  rh:          ['meus-dados','visualizar','atualizar','kanban','calendario','cadastros','funcionarios'],
  colaborador: ['meus-dados','visualizar','atualizar','kanban','calendario','site','noticias','publicacoes','cases','publicacoes-cases','blog','publicacoes-blog',...IMPRENSA_COLAB],
  atendente:   ['meus-dados','visualizar','atualizar','kanban','calendario','cadastros','clientes','site','noticias','publicacoes','cases','publicacoes-cases','blog','publicacoes-blog',...IMPRENSA_BASE],
}

export function getAncestors(id: string): string[] {
  const result: string[] = []
  let node = MENU_NODES.find(n => n.id === id)
  while (node?.parentId) {
    result.push(node.parentId)
    node = MENU_NODES.find(n => n.id === node!.parentId)
  }
  return result
}

export function getDescendants(id: string): string[] {
  const result: string[] = []
  const children = MENU_NODES.filter(n => n.parentId === id)
  for (const child of children) {
    result.push(child.id)
    result.push(...getDescendants(child.id))
  }
  return result
}

/** Expande IDs de grupo para incluir todos os descendentes, garantindo que
 *  os dois menus (central e lateral) mostrem os mesmos itens. */
export function expandPermissions(ids: string[]): Set<string> {
  const expanded = new Set(ids)
  for (const id of ids) {
    for (const desc of getDescendants(id)) expanded.add(desc)
  }
  return expanded
}

export function applyToggle(current: Set<string>, id: string, on: boolean): Set<string> {
  const next = new Set(current)
  if (on) {
    next.add(id)
    for (const a of getAncestors(id)) next.add(a)
  } else {
    next.delete(id)
    for (const d of getDescendants(id)) next.delete(d)
  }
  return next
}

export type TreeNode = {
  id: string
  label: string
  isGroup: boolean
  children: TreeNode[]
}

export function buildTree(): TreeNode[] {
  function build(parentId: string | null): TreeNode[] {
    return MENU_NODES
      .filter(n => n.parentId === parentId)
      .map(n => ({ id: n.id, label: n.label, isGroup: n.isGroup, children: build(n.id) }))
  }
  return build(null)
}
