'use client'

import { useState } from 'react'
import { type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

// ── Props (mantidas para compatibilidade com os layouts existentes) ──

export interface CornerMenuItem {
  id: string
  label: string
  href: string
  exact?: boolean
  icon: ReactNode
}

interface Props {
  items: CornerMenuItem[]
  parentItems?: CornerMenuItem[]
  backHref?: string
  backLabel?: string
}

// ── Árvore de navegação completa ────────────────────────────────────

type NavLeaf  = { kind: 'leaf';  id: string; label: string; icon: ReactNode; href: string }
type NavGroup = { kind: 'group'; id: string; label: string; icon: ReactNode; children: NavNode[] }
type NavNode  = NavLeaf | NavGroup

const NAV_TREE: NavNode[] = [
  {
    kind: 'group', id: 'kanban', label: 'Kanban',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
    children: [
      {
        kind: 'leaf', id: 'quadros', label: 'Quadros', href: '/sistema/kanban',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
          </svg>
        ),
      },
      {
        kind: 'leaf', id: 'calendario', label: 'Calendário', href: '/sistema/calendario',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
        ),
      },
    ],
  },
  {
    kind: 'leaf', id: 'solicitacoes', label: 'Solicitações', href: '/sistema/solicitacoes',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
      </svg>
    ),
  },
  {
    kind: 'group', id: 'cadastros', label: 'Cadastros',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
    children: [
      {
        kind: 'leaf', id: 'funcionarios', label: 'Colaboradores', href: '/sistema/cadastros/funcionarios',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        ),
      },
      {
        kind: 'leaf', id: 'clientes', label: 'Clientes', href: '/sistema/cadastros/clientes',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
          </svg>
        ),
      },
      {
        kind: 'leaf', id: 'equipes', label: 'Equipes', href: '/sistema/equipes',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
          </svg>
        ),
      },
    ],
  },
  {
    kind: 'group', id: 'site', label: 'Site',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0H3" />
      </svg>
    ),
    children: [
      {
        kind: 'leaf', id: 'editar-site', label: 'Editar Site', href: '/sistema/site',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
          </svg>
        ),
      },
      {
        kind: 'group', id: 'noticias', label: 'Notícias',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
          </svg>
        ),
        children: [
          {
            kind: 'leaf', id: 'nova-noticia', label: 'Nova Notícia', href: '/sistema/blog/novo',
            icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            ),
          },
          {
            kind: 'leaf', id: 'publicacoes', label: 'Publicações', href: '/sistema/blog',
            icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
            ),
          },
          {
            kind: 'leaf', id: 'rascunhos', label: 'Rascunhos', href: '/sistema/blog/rascunhos',
            icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
              </svg>
            ),
          },
          {
            kind: 'leaf', id: 'relatorios', label: 'Relatórios', href: '/sistema/blog/relatorios',
            icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            ),
          },
        ],
      },
    ],
  },
]

// ── Helpers ─────────────────────────────────────────────────────────

function getNodesAtPath(path: string[]): NavNode[] {
  let nodes: NavNode[] = NAV_TREE
  for (const id of path) {
    const found = nodes.find(n => n.id === id)
    if (!found || found.kind !== 'group') return []
    nodes = found.children
  }
  return nodes
}

function getPositions(count: number, radius = 140) {
  if (count === 0) return []
  if (count === 1) return [{ x: radius, y: 0 }]
  const start = -80, end = 80
  return Array.from({ length: count }, (_, i) => {
    const r = (start + (i * (end - start)) / (count - 1)) * (Math.PI / 180)
    return { x: Math.cos(r) * radius, y: Math.sin(r) * radius }
  })
}

const TX = 36

// ── Estágio do menu ─────────────────────────────────────────────────
// 'section'  → mostra items/parentItems da seção atual
// 'tree'     → navega na árvore NAV_TREE

type Stage =
  | { kind: 'section'; sub: 'current' | 'parent' }
  | { kind: 'tree';    path: string[] }

// ── Componente ──────────────────────────────────────────────────────

export function CornerRadialMenu({ items, parentItems }: Props) {
  const [open, setOpen]   = useState(false)
  const [stage, setStage] = useState<Stage>({ kind: 'section', sub: 'current' })
  const pathname  = usePathname()
  const router    = useRouter()

  function close() {
    setOpen(false)
    setStage({ kind: 'section', sub: 'current' })
  }

  function handleBack() {
    if (stage.kind === 'section') {
      if (stage.sub === 'current' && parentItems?.length) {
        setStage({ kind: 'section', sub: 'parent' })
      } else {
        // Sobe para a raiz da árvore
        setStage({ kind: 'tree', path: [] })
      }
    } else {
      if (stage.path.length > 0) {
        setStage({ kind: 'tree', path: stage.path.slice(0, -1) })
      }
      // Em path=[] não há Voltar — só o botão Painel
    }
  }

  function handleTreeNode(node: NavNode) {
    if (node.kind === 'group') {
      // Ainda é navegação de menu — fica no menu
      setStage({ kind: 'tree', path: [...(stage as { kind: 'tree'; path: string[] }).path, node.id] })
    } else {
      // Folha: navega de verdade
      router.push(node.href)
      close()
    }
  }

  // ── Qual lista mostrar ──────────────────────────────────────────
  type ArcEntry = {
    id: string
    label: string
    icon: ReactNode
    isCurrent: boolean
    action: 'section-link' | 'back' | 'home' | 'tree-node'
    href?: string
    node?: NavNode
  }

  let bodyItems: ArcEntry[]

  if (stage.kind === 'section') {
    const list = stage.sub === 'parent' ? (parentItems ?? items) : items
    bodyItems = list.map(it => ({
      id: it.id,
      label: it.label,
      icon: it.icon,
      href: it.href,
      isCurrent: it.exact ? pathname === it.href : pathname.startsWith(it.href),
      action: 'section-link' as const,
    }))
  } else {
    const nodes = getNodesAtPath(stage.path)
    bodyItems = nodes.map(node => ({
      id: node.id,
      label: node.label,
      icon: node.icon,
      isCurrent: node.kind === 'leaf' && pathname.startsWith(node.href),
      action: 'tree-node' as const,
      node,
    }))
  }

  // Botão final: Voltar ou Painel
  const atTreeRoot = stage.kind === 'tree' && stage.path.length === 0
  const finalBtn: ArcEntry = atTreeRoot
    ? {
        id: '__home', label: 'Painel', icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
        ),
        isCurrent: false, action: 'home',
      }
    : {
        id: '__back', label: 'Voltar', icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        ),
        isCurrent: false, action: 'back',
      }

  const arcItems: ArcEntry[] = [...bodyItems, finalBtn]
  const positions = getPositions(arcItems.length)

  // ── Estilos ─────────────────────────────────────────────────────

  function btnCls(isCurrent: boolean, isHome = false) {
    if (isHome) return 'w-12 h-12 rounded-full flex items-center justify-center shadow-xl border-2 transition-all duration-200 bg-white dark:bg-[#1c1c1c] border-navy dark:border-white/20 text-navy dark:text-gray-300 hover:bg-navy hover:border-navy hover:text-white hover:scale-110'
    return [
      'w-12 h-12 rounded-full flex items-center justify-center shadow-xl border-2 transition-all duration-200',
      isCurrent
        ? 'bg-gold border-gold text-white scale-110'
        : 'bg-white dark:bg-[#1c1c1c] border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-300 hover:bg-gold hover:border-gold hover:text-white hover:scale-110',
    ].join(' ')
  }

  // Mostra um pequeno indicador de "tem filhos" nos grupos
  function groupIndicator(node?: NavNode) {
    if (!node || node.kind !== 'group') return null
    return (
      <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-gold rounded-full border-2 border-white dark:border-[#1c1c1c] flex items-center justify-center">
        <svg className="w-1.5 h-1.5 text-white" fill="currentColor" viewBox="0 0 6 6">
          <path d="M3 1l2 2H1z"/>
        </svg>
      </span>
    )
  }

  return (
    <>
      {/* Arc items */}
      {arcItems.map((item, i) => {
        const p = positions[i]
        const isHome = item.action === 'home'
        const isBack = item.action === 'back'

        return (
          <div
            key={`${JSON.stringify(stage)}-${item.id}`}
            className="fixed z-40 flex flex-col items-center"
            style={{
              left: TX + p.x - 24,
              top: `calc(50vh + ${p.y - 24}px)`,
              transform: open ? 'translate(0,0)' : `translate(${-p.x}px,${-p.y}px)`,
              opacity: open ? 1 : 0,
              pointerEvents: open ? 'auto' : 'none',
              transition: 'transform 0.44s cubic-bezier(0.34,1.56,0.64,1), opacity 0.22s ease',
              transitionDelay: open ? `${i * 0.055}s` : '0s',
            }}
          >
            {isBack ? (
              <button onClick={handleBack} className={btnCls(false)}>
                {item.icon}
              </button>
            ) : isHome ? (
              <Link href="/sistema" onClick={close} className={btnCls(false, true)}>
                {item.icon}
              </Link>
            ) : item.action === 'section-link' ? (
              <Link href={item.href!} onClick={close} className={btnCls(item.isCurrent)}>
                {item.icon}
              </Link>
            ) : (
              /* tree-node: grupo → fica no menu; folha → navega */
              <div className="relative">
                <button
                  onClick={() => handleTreeNode(item.node!)}
                  className={btnCls(item.isCurrent)}
                >
                  {item.icon}
                </button>
                {groupIndicator(item.node)}
              </div>
            )}

            <span className={[
              'mt-1.5 text-[9px] font-bold uppercase tracking-widest whitespace-nowrap select-none',
              item.isCurrent ? 'text-gold' :
              isHome         ? 'text-navy dark:text-gray-300' :
              'text-gray-600 dark:text-gray-200',
            ].join(' ')}>
              {item.label}
            </span>
          </div>
        )
      })}

      {/* Trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Fechar menu' : 'Abrir menu'}
        className={[
          'fixed z-50 flex items-center justify-center rounded-full border-2 transition-all duration-300',
          open
            ? 'bg-gold border-gold text-white'
            : 'bg-white dark:bg-[#1c1c1c] border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400',
        ].join(' ')}
        style={{
          width: 56, height: 56,
          left: TX - 28, top: 'calc(50vh - 28px)',
          boxShadow: open
            ? '0 0 0 6px rgba(181,40,44,0.18), 0 8px 40px rgba(0,0,0,0.28)'
            : '0 4px 20px rgba(0,0,0,0.14)',
        }}
      >
        {open ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        )}
      </button>

      {/* Disco de fundo */}
      {open && (
        <div
          className="fixed z-[35] bg-white dark:bg-[#111111] rounded-full pointer-events-none"
          style={{ width: 450, height: 450, left: TX - 225, top: 'calc(50vh - 225px)' }}
        />
      )}

      {/* Backdrop */}
      {open && <div className="fixed inset-0 z-30" onClick={close} />}
    </>
  )
}
