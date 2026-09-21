'use client'

import { useMemo, useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { getUnseenSolicitacoesCount } from '../actions/solicitacoes'

// ── Tipos ──────────────────────────────────────────────────────────

type GroupId    = 'site' | 'cadastros'
type SubGroupId = 'noticias'

interface SubItem {
  id: string
  label: string
  href: string
  icon: ReactNode
}

interface SubGroupItem {
  type: 'subgroup'
  id: SubGroupId
  label: string
  icon: ReactNode
  largeIcon: ReactNode
  subItems: SubItem[]
}

interface LinkSubItem {
  type?: undefined
  id: string
  label: string
  href: string
  icon: ReactNode
}

type AnySubItem = LinkSubItem | SubGroupItem

interface LinkItem {
  type: 'link'
  id: string
  label: string
  href: string
  icon: ReactNode
  badge?: number
}

interface GroupItem {
  type: 'group'
  id: GroupId
  label: string
  icon: ReactNode
  largeIcon: ReactNode
  subItems: AnySubItem[]
}

type AnyItem = LinkItem | GroupItem

// ── Ícones ─────────────────────────────────────────────────────────

const IconCadastros = ({ px = 24 }: { px?: number }) => (
  <svg style={{ width: px, height: px }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
)

const IconFuncionario = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
)

const IconCliente = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
  </svg>
)

const IconSite = ({ px = 24 }: { px?: number }) => (
  <svg style={{ width: px, height: px }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0H3" />
  </svg>
)

const IconEditar = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
  </svg>
)

const IconNoticias = ({ px = 24 }: { px?: number }) => (
  <svg style={{ width: px, height: px }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
  </svg>
)

const IconNovaNoticia = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
)

const IconRelatorio = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
)

const IconRascunho = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
  </svg>
)

const IconPublicacoes = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
  </svg>
)

const IconEquipes = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
  </svg>
)

const IconSolicitacoes = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
  </svg>
)

const IconBack = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
)

// ── Posições radiais ───────────────────────────────────────────────

function getPositions(count: number, radius = 165) {
  if (count === 0) return []
  if (count === 1) return [{ x: 0, y: -radius }]
  const spread = Math.min(200, count * 65)
  const step = spread / (count - 1)
  const start = -spread / 2
  return Array.from({ length: count }, (_, i) => {
    const rad = ((start + i * step) * Math.PI) / 180
    return { x: Math.sin(rad) * radius, y: -Math.cos(rad) * radius }
  })
}

// ── Componente ─────────────────────────────────────────────────────

export function RadialMenu() {
  const [open, setOpen] = useState(false)
  const [activeGroup, setActiveGroup] = useState<GroupId | null>(null)
  const [activeSubGroup, setActiveSubGroup] = useState<SubGroupId | null>(null)
  const [hasOpened, setHasOpened] = useState(false)
  const [unseenCount, setUnseenCount] = useState(0)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const count = await getUnseenSolicitacoesCount(user.id)
      setUnseenCount(count)
    })
  }, [])

  const noticiaSubItems = useMemo<SubItem[]>(() => [
    { id: 'nova-noticia', label: 'Nova Notícia', href: '/sistema/blog/novo',         icon: <IconNovaNoticia /> },
    { id: 'publicacoes',  label: 'Publicações',  href: '/sistema/blog',              icon: <IconPublicacoes /> },
    { id: 'rascunhos',    label: 'Rascunhos',    href: '/sistema/blog/rascunhos',    icon: <IconRascunho /> },
    { id: 'relatorios',   label: 'Relatórios',   href: '/sistema/blog/relatorios',   icon: <IconRelatorio /> },
  ], [])

  // Estrutura de itens
  const MAIN_ITEMS = useMemo<AnyItem[]>(() => [
    {
      type: 'link',
      id: 'solicitacoes',
      label: 'Solicitações',
      href: '/sistema/solicitacoes',
      icon: <IconSolicitacoes />,
      badge: unseenCount,
    },
    {
      type: 'group',
      id: 'cadastros',
      label: 'Cadastros',
      icon: <IconCadastros px={24} />,
      largeIcon: <IconCadastros px={36} />,
      subItems: [
        { id: 'funcionarios', label: 'Colaboradores', href: '/sistema/cadastros/funcionarios', icon: <IconFuncionario /> },
        { id: 'clientes',     label: 'Clientes',     href: '/sistema/cadastros/clientes',     icon: <IconCliente /> },
        { id: 'equipes',      label: 'Equipes',      href: '/sistema/equipes',                icon: <IconEquipes /> },
      ],
    },
    {
      type: 'group',
      id: 'site',
      label: 'Site',
      icon: <IconSite px={24} />,
      largeIcon: <IconSite px={36} />,
      subItems: [
        { id: 'editar-site', label: 'Editar Site', href: '/sistema/site', icon: <IconEditar /> },
        {
          type: 'subgroup',
          id: 'noticias',
          label: 'Notícias',
          icon:      <IconNoticias px={24} />,
          largeIcon: <IconNoticias px={36} />,
          subItems:  noticiaSubItems,
        } as SubGroupItem,
      ],
    },
  ], [noticiaSubItems, unseenCount])

  const mainPositions = getPositions(MAIN_ITEMS.length)

  const activeGroupData = MAIN_ITEMS.find(
    (item): item is GroupItem => item.type === 'group' && item.id === activeGroup,
  )

  const activeSubGroupData = activeGroupData?.subItems.find(
    (item): item is SubGroupItem => item.type === 'subgroup' && item.id === activeSubGroup,
  )

  const level2Items   = activeGroupData?.subItems ?? []
  const level2Positions = getPositions(level2Items.length)

  const level3Items   = activeSubGroupData?.subItems ?? []
  const level3Positions = getPositions(level3Items.length)

  function close() {
    setOpen(false)
    setActiveGroup(null)
    setActiveSubGroup(null)
  }

  function openGroup(id: GroupId) {
    setActiveGroup(id)
    setActiveSubGroup(null)
  }

  function openSubGroup(id: SubGroupId) {
    setActiveSubGroup(id)
  }

  function backFromSubGroup() { setActiveSubGroup(null) }
  function backFromGroup()    { setActiveGroup(null); setActiveSubGroup(null) }

  // Derived booleans
  const level1Open  = open && !activeGroup
  const level2Open  = !!activeGroup && !activeSubGroup
  const level3Open  = !!activeSubGroup

  // Which center circle is showing:
  //  - L2: the group circle (e.g. Site)
  //  - L3: the subgroup circle (e.g. Notícias)
  const centerGroup    = !!activeGroup && !activeSubGroup
  const centerSubGroup = !!activeSubGroup

  const ITEM_BTN =
    'rounded-full flex items-center justify-center bg-gray-100 dark:bg-[#1c1c1c] border border-gray-200 dark:border-white/12 text-gray-500 dark:text-gray-300 hover:bg-gold hover:text-white hover:border-gold shadow-xl transition-all duration-200 hover:scale-110'

  const LABEL =
    'text-gray-700 dark:text-white text-[11px] font-semibold tracking-wider uppercase whitespace-nowrap drop-shadow-lg mt-2'

  const CENTER_STYLE = {
    backgroundColor: 'white',
    border: 'none',
    boxShadow: '0 0 0 8px rgba(181,40,44,0.18), 0 0 0 16px rgba(181,40,44,0.07), 0 24px 64px rgba(0,0,0,0.35)',
  }

  return (
    <div
      className="relative flex items-center justify-center select-none"
      style={{ width: 480, height: 480 }}
    >
      {/* Radar rings */}
      {[196, 300, 404].map((size, i) => (
        <div
          key={size}
          className="absolute rounded-full border pointer-events-none animate-radar"
          style={{
            width: size,
            height: size,
            borderColor: `rgba(181,40,44,${0.22 - i * 0.06})`,
            animationDelay: `${i * 1.3}s`,
            animationDuration: `${4 + i}s`,
          }}
        />
      ))}

      {/* ── NÍVEL 1 — Itens principais ─────────────────────── */}
      {MAIN_ITEMS.map((item, i) => {
        const pos      = mainPositions[i]
        const isGroup  = item.type === 'group'
        // Nível 1 só fica no centro enquanto não há sub-grupo ativo
        const isCenter = isGroup && activeGroup === item.id && !activeSubGroup

        const transform = isCenter
          ? 'translate(-50%, -50%)'
          : level1Open
          ? `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`
          : 'translate(-50%, -50%)'

        const visible = level1Open || isCenter
        const btnSize = isCenter ? 128 : 64

        return (
          <div
            key={item.id}
            className="absolute flex flex-col items-center"
            style={{
              left: '50%', top: '50%',
              transform,
              opacity: visible ? 1 : 0,
              pointerEvents: visible ? 'auto' : 'none',
              transition: 'transform 0.48s cubic-bezier(0.34,1.56,0.64,1), opacity 0.28s ease',
              transitionDelay: level1Open && !isCenter ? `${i * 0.06}s` : '0s',
              zIndex: isCenter ? 10 : 20,
            }}
          >
            {isGroup ? (
              <>
                <button
                  onClick={() => isCenter ? backFromGroup() : openGroup(item.id as GroupId)}
                  className={ITEM_BTN}
                  style={{
                    width: btnSize,
                    height: btnSize,
                    transition: 'width 0.38s cubic-bezier(0.34,1.56,0.64,1), height 0.38s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s, background-color 0.3s',
                    ...(isCenter ? CENTER_STYLE : {}),
                  }}
                  aria-label={isCenter ? 'Voltar' : item.label}
                >
                  {isCenter ? (
                    <div className="relative flex items-center justify-center w-full h-full">
                      <span className="text-gray-600">{(item as GroupItem).largeIcon}</span>
                      <span className="absolute -top-1 -left-1 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 shadow" title="Voltar">
                        <IconBack />
                      </span>
                    </div>
                  ) : item.icon}
                </button>
                {!isCenter && <span className={LABEL}>{item.label}</span>}
              </>
            ) : (
              <>
                <div className="relative">
                  <Link href={(item as LinkItem).href} onClick={close} className={`w-16 h-16 ${ITEM_BTN}`}>
                    {item.icon}
                  </Link>
                  {(item as LinkItem).badge != null && (item as LinkItem).badge! > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 flex items-center justify-center rounded-full bg-gold text-white text-[10px] font-bold shadow-lg pointer-events-none">
                      {(item as LinkItem).badge! > 99 ? '99+' : (item as LinkItem).badge}
                    </span>
                  )}
                </div>
                <span className={LABEL}>{item.label}</span>
              </>
            )}
          </div>
        )
      })}

      {/* ── NÍVEL 2 — Sub-itens do grupo ativo ─────────────── */}
      {level2Items.map((item, i) => {
        const pos = level2Positions[i]
        const isSubGroup = item.type === 'subgroup'
        const isCenterSubGroup = isSubGroup && activeSubGroup === item.id

        const transform = isCenterSubGroup
          ? 'translate(-50%, -50%)'
          : level2Open
          ? `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`
          : 'translate(-50%, -50%)'

        const visible = level2Open || isCenterSubGroup
        const btnSize = isCenterSubGroup ? 112 : 64

        return (
          <div
            key={item.id}
            className="absolute flex flex-col items-center"
            style={{
              left: '50%', top: '50%',
              transform,
              opacity: visible ? 1 : 0,
              pointerEvents: visible ? 'auto' : 'none',
              transition: 'transform 0.48s cubic-bezier(0.34,1.56,0.64,1), opacity 0.25s ease',
              transitionDelay: level2Open && !isCenterSubGroup ? `${0.1 + i * 0.07}s` : '0s',
              zIndex: isCenterSubGroup ? 10 : 20,
            }}
          >
            {isSubGroup ? (
              <>
                <button
                  onClick={() => isCenterSubGroup ? backFromSubGroup() : openSubGroup((item as SubGroupItem).id)}
                  className={ITEM_BTN}
                  style={{
                    width: btnSize,
                    height: btnSize,
                    transition: 'width 0.38s cubic-bezier(0.34,1.56,0.64,1), height 0.38s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s, background-color 0.3s',
                    ...(isCenterSubGroup ? CENTER_STYLE : {}),
                  }}
                  aria-label={(item as SubGroupItem).label}
                >
                  {isCenterSubGroup ? (
                    <div className="relative flex items-center justify-center w-full h-full">
                      <span className="text-gray-600">{(item as SubGroupItem).largeIcon}</span>
                      <span className="absolute -top-1 -left-1 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 shadow" title="Voltar">
                        <IconBack />
                      </span>
                    </div>
                  ) : (item as SubGroupItem).icon}
                </button>
                {!isCenterSubGroup && <span className={LABEL}>{(item as SubGroupItem).label}</span>}
              </>
            ) : (
              <>
                <Link href={(item as LinkSubItem).href} onClick={close} className={`w-16 h-16 ${ITEM_BTN}`}>
                  {(item as LinkSubItem).icon}
                </Link>
                <span className={LABEL}>{(item as LinkSubItem).label}</span>
              </>
            )}
          </div>
        )
      })}

      {/* ── NÍVEL 3 — Sub-itens do sub-grupo ativo ─────────── */}
      {level3Items.map((item, i) => {
        const pos = level3Positions[i]
        return (
          <div
            key={item.id}
            className="absolute flex flex-col items-center"
            style={{
              left: '50%', top: '50%',
              transform: level3Open
                ? `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`
                : 'translate(-50%, -50%)',
              opacity: level3Open ? 1 : 0,
              pointerEvents: level3Open ? 'auto' : 'none',
              transition: 'transform 0.48s cubic-bezier(0.34,1.56,0.64,1), opacity 0.25s ease',
              transitionDelay: level3Open ? `${0.1 + i * 0.08}s` : '0s',
              zIndex: 20,
            }}
          >
            <Link href={item.href} onClick={close} className={`w-16 h-16 ${ITEM_BTN}`}>
              {item.icon}
            </Link>
            <span className={LABEL}>{item.label}</span>
          </div>
        )
      })}

      {/* ── Botão central (logo) ─────────────────────────────── */}
      <button
        onClick={() => {
          if (!activeGroup) {
            setHasOpened(true)
            setOpen((o) => !o)
          }
        }}
        className="relative z-10 w-[128px] h-[128px] rounded-full bg-white hover:scale-105 focus:outline-none"
        style={{
          opacity: (centerGroup || centerSubGroup) ? 0 : 1,
          pointerEvents: (centerGroup || centerSubGroup) ? 'none' : 'auto',
          transition: 'opacity 0.25s ease, transform 0.2s ease',
          boxShadow: open
            ? '0 0 0 8px rgba(181,40,44,0.18), 0 0 0 16px rgba(181,40,44,0.07), 0 24px 64px rgba(0,0,0,0.35)'
            : '0 8px 40px rgba(0,0,0,0.2)',
        }}
        aria-label={open ? 'Fechar menu' : 'Abrir menu'}
      >
        <Image
          src="/images/logo_santospress.png"
          alt="Santos Press"
          fill
          className="object-contain p-5"
        />
      </button>

      {/* Click-away overlay */}
      {(open || activeGroup) && (
        <div className="fixed inset-0 z-0" onClick={close} />
      )}

      {/* Dica — some após o primeiro clique */}
      {!hasOpened && (
        <p
          className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-gray-400 dark:text-gray-700 text-[10px] whitespace-nowrap pointer-events-none"
          style={{ transition: 'opacity 0.3s ease' }}
        >
          Clique no logo para abrir o menu
        </p>
      )}
    </div>
  )
}
