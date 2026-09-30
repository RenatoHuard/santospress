'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

type Level = 'closed' | 'main' | 'meus-dados' | 'cadastros' | 'site' | 'noticias' | 'cases'

const PREFERRED_ANGLES: Record<number, number[]> = {
  1: [-90],
  2: [180, 0],
  3: [-90, 0, 180],
  4: [-135, -45, 45, 135],
}

function getPositions(count: number, radius = 165) {
  if (count === 0) return []
  const degrees = PREFERRED_ANGLES[count]
    ?? Array.from({ length: count }, (_, i) => i * (360 / count) - 90)
  return degrees.map(deg => {
    const a = deg * (Math.PI / 180)
    return { x: Math.cos(a) * radius, y: Math.sin(a) * radius }
  })
}

const ITEM_BTN =
  'rounded-full flex items-center justify-center bg-gray-100 dark:bg-[#1c1c1c] border border-gray-200 dark:border-white/12 text-gray-500 dark:text-gray-300 hover:bg-gold hover:text-white hover:border-gold shadow-xl transition-all duration-200 hover:scale-110'

const LABEL =
  'text-gray-700 dark:text-white text-[11px] font-semibold tracking-wider uppercase whitespace-nowrap drop-shadow-lg mt-2'

const CENTER_STYLE = {
  backgroundColor: 'white',
  border: 'none',
  boxShadow: '0 0 0 8px rgba(181,40,44,0.18), 0 0 0 16px rgba(181,40,44,0.07), 0 24px 64px rgba(0,0,0,0.35)',
}

// ── Ícones ──────────────────────────────────────────────────────────

const IconUser = ({ size = 24 }: { size?: number }) => (
  <svg style={{ width: size, height: size }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
)

const IconSite = ({ size = 24 }: { size?: number }) => (
  <svg style={{ width: size, height: size }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0H3" />
  </svg>
)

const IconNoticias = ({ size = 24 }: { size?: number }) => (
  <svg style={{ width: size, height: size }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
  </svg>
)

const IconEye = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const IconEdit = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
  </svg>
)

const IconNovaNoticia = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
)

const IconPublicacoes = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
  </svg>
)

const IconRascunho = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
  </svg>
)

const IconRelatorio = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
)

const IconCases = ({ size = 24 }: { size?: number }) => (
  <svg style={{ width: size, height: size }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
  </svg>
)

const IconCadastros = ({ size = 24 }: { size?: number }) => (
  <svg style={{ width: size, height: size }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
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

const IconBack = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
)

const IconKanban = ({ size = 24 }: { size?: number }) => (
  <svg style={{ width: size, height: size }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
  </svg>
)

const IconCalendario = ({ size = 24 }: { size?: number }) => (
  <svg style={{ width: size, height: size }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
)

// ── Itens por nível ──────────────────────────────────────────────────

const MEUS_DADOS_ITEMS = [
  { id: 'visualizar', label: 'Visualizar',     href: '/sistema/perfil?modo=ver',    icon: <IconEye /> },
  { id: 'atualizar',  label: 'Atualizar Dados', href: '/sistema/perfil?modo=editar', icon: <IconEdit /> },
]

const SITE_ITEMS = [
  { id: 'editar-site', label: 'Editar Site', href: '/sistema/site', icon: <IconEdit />,     isGroup: false, groupLevel: undefined as Level | undefined },
  { id: 'noticias',    label: 'Notícias',    href: '#',             icon: <IconNoticias />, isGroup: true,  groupLevel: 'noticias' as Level },
  { id: 'cases',       label: 'Post Cases',  href: '#',             icon: <IconCases />,    isGroup: true,  groupLevel: 'cases' as Level },
]

const NOTICIAS_ITEMS = [
  { id: 'nova-noticia', label: 'Nova Notícia', href: '/sistema/blog/novo',         icon: <IconNovaNoticia /> },
  { id: 'publicacoes',  label: 'Publicações',  href: '/sistema/blog',              icon: <IconPublicacoes /> },
  { id: 'rascunhos',    label: 'Rascunhos',    href: '/sistema/blog/rascunhos',    icon: <IconRascunho /> },
  { id: 'relatorios',   label: 'Relatórios',   href: '/sistema/blog/relatorios',   icon: <IconRelatorio /> },
]

const CASES_ITEMS = [
  { id: 'nova-case',         label: 'Nova Case',   href: '/sistema/cases/novo',       icon: <IconNovaNoticia /> },
  { id: 'publicacoes-cases', label: 'Publicações', href: '/sistema/cases',            icon: <IconPublicacoes /> },
  { id: 'rascunhos-cases',   label: 'Rascunhos',   href: '/sistema/cases/rascunhos',  icon: <IconRascunho /> },
  { id: 'relatorios-cases',  label: 'Relatórios',  href: '/sistema/cases/relatorios', icon: <IconRelatorio /> },
]

const CADASTROS_ITEMS = [
  { id: 'funcionarios', label: 'Colaboradores', href: '/sistema/cadastros/funcionarios', icon: <IconFuncionario /> },
  { id: 'clientes',     label: 'Clientes',      href: '/sistema/cadastros/clientes',     icon: <IconCliente /> },
]

// ── Componente ───────────────────────────────────────────────────────

export function MeuMenuRadial({ enabledIds }: { enabledIds?: Set<string> | null }) {
  const router = useRouter()
  const [level, setLevel] = useState<Level>('closed')
  const [hasOpened, setHasOpened] = useState(false)

  const ok = (id: string) => !enabledIds || enabledIds.has(id)

  const isMain       = level === 'main'
  const isMeusDados  = level === 'meus-dados'
  const isCadastros  = level === 'cadastros'
  const isSite       = level === 'site'
  const isNoticias   = level === 'noticias'
  const isCases      = level === 'cases'

  function close()       { setLevel('closed') }
  function openMain()    { setHasOpened(true); setLevel('main') }
  function backToMain()  { setLevel('main') }

  // Itens filtrados por permissão
  const filteredMeusDadosItems  = MEUS_DADOS_ITEMS.filter(i => ok(i.id))
  const filteredCadastrosItems  = CADASTROS_ITEMS.filter(i => ok(i.id))
  const filteredNoticiasItems   = NOTICIAS_ITEMS.filter(i => ok(i.id))
  const filteredCasesItems      = CASES_ITEMS.filter(i => ok(i.id))
  const filteredSiteItems       = SITE_ITEMS.filter(i => {
    if (i.id === 'noticias') return ok('noticias') && filteredNoticiasItems.length > 0
    if (i.id === 'cases')    return ok('cases') && filteredCasesItems.length > 0
    return ok(i.id)
  })

  const allMainItems = [
    { id: 'meus-dados', label: 'Meus Dados', icon: <IconUser />,         largeIcon: <IconUser size={36} />,         href: undefined,             onClick: () => setLevel('meus-dados') },
    { id: 'kanban',     label: 'Kanban',     icon: <IconKanban />,       largeIcon: <IconKanban size={36} />,       href: '/sistema/kanban',     onClick: undefined },
    { id: 'calendario', label: 'Calendário', icon: <IconCalendario />,   largeIcon: <IconCalendario size={36} />,   href: '/sistema/calendario', onClick: undefined },
    { id: 'cadastros',  label: 'Cadastros',  icon: <IconCadastros />,    largeIcon: <IconCadastros size={36} />,    href: undefined,             onClick: () => setLevel('cadastros') },
    { id: 'site',       label: 'Site',       icon: <IconSite />,         largeIcon: <IconSite size={36} />,         href: undefined,             onClick: () => setLevel('site') },
  ]

  const mainItems = allMainItems.filter(i => {
    if (i.id === 'meus-dados') return ok('meus-dados') && filteredMeusDadosItems.length > 0
    if (i.id === 'cadastros')  return ok('cadastros') && filteredCadastrosItems.length > 0
    if (i.id === 'site')       return ok('site') && filteredSiteItems.length > 0
    return ok(i.id)
  })

  const mainPositions    = getPositions(mainItems.length)
  const meusDadosPos     = getPositions(filteredMeusDadosItems.length)
  const cadastrosPos     = getPositions(filteredCadastrosItems.length)
  const sitePos          = getPositions(filteredSiteItems.length)
  const noticiasPos      = getPositions(filteredNoticiasItems.length)
  const casesPos         = getPositions(filteredCasesItems.length)

  // Qual grupo está no centro (apenas grupos com sub-nível)
  const centerGroup = isMeusDados ? 'meus-dados' : isCadastros ? 'cadastros' : isSite || isNoticias || isCases ? 'site' : null

  // Aliases para clareza no JSX abaixo
  const activeMeusDadosItems  = filteredMeusDadosItems
  const activeCadastrosItems  = filteredCadastrosItems
  const activeSiteItems       = filteredSiteItems
  const activeNoticiasItems   = filteredNoticiasItems
  const activeCasesItems      = filteredCasesItems

  return (
    <div className="relative flex items-center justify-center select-none" style={{ width: 480, height: 480 }}>

      {/* Radar rings */}
      {[196, 300, 404].map((size, i) => (
        <div
          key={size}
          className="absolute rounded-full border pointer-events-none animate-radar"
          style={{
            width: size, height: size,
            borderColor: `rgba(181,40,44,${0.22 - i * 0.06})`,
            animationDelay: `${i * 1.3}s`,
            animationDuration: `${4 + i}s`,
          }}
        />
      ))}

      {/* ── Nível 1: Meus Dados + Site ──────────────────────── */}
      {mainItems.map((item, i) => {
        const pos      = mainPositions[i]
        const isCenter = centerGroup === item.id

        return (
          <div
            key={item.id}
            className="absolute flex flex-col items-center"
            style={{
              left: '50%', top: '50%',
              transform: isCenter
                ? 'translate(-50%, -50%)'
                : isMain
                ? `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`
                : 'translate(-50%, -50%)',
              opacity: (isMain || isCenter) ? 1 : 0,
              pointerEvents: (isMain || isCenter) ? 'auto' : 'none',
              transition: 'transform 0.48s cubic-bezier(0.34,1.56,0.64,1), opacity 0.28s ease',
              transitionDelay: isMain && !isCenter ? `${i * 0.06}s` : '0s',
              zIndex: isCenter ? 10 : 20,
            }}
          >
            <button
              onClick={() => {
                if (isCenter) { backToMain(); return }
                if (item.href) { close(); router.push(item.href) }
                else item.onClick?.()
              }}
              className={ITEM_BTN}
              style={{
                width:  isCenter ? 128 : 64,
                height: isCenter ? 128 : 64,
                transition: 'width 0.38s cubic-bezier(0.34,1.56,0.64,1), height 0.38s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s',
                ...(isCenter ? CENTER_STYLE : {}),
              }}
              aria-label={isCenter ? 'Voltar' : item.label}
            >
              {isCenter ? (
                <div className="relative flex items-center justify-center w-full h-full">
                  <span className="text-gray-600">{item.largeIcon}</span>
                  <span className="absolute -top-1 -left-1 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 shadow">
                    <IconBack />
                  </span>
                </div>
              ) : item.icon}
            </button>
            {!isCenter && <span className={LABEL}>{item.label}</span>}
          </div>
        )
      })}

      {/* ── Nível 2a: sub-itens de Meus Dados ───────────────── */}
      {activeMeusDadosItems.map((item, i) => {
        const pos = meusDadosPos[i]
        return (
          <div
            key={item.id}
            className="absolute flex flex-col items-center"
            style={{
              left: '50%', top: '50%',
              transform: isMeusDados
                ? `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`
                : 'translate(-50%, -50%)',
              opacity: isMeusDados ? 1 : 0,
              pointerEvents: isMeusDados ? 'auto' : 'none',
              transition: 'transform 0.48s cubic-bezier(0.34,1.56,0.64,1), opacity 0.25s ease',
              transitionDelay: isMeusDados ? `${0.1 + i * 0.08}s` : '0s',
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

      {/* ── Nível 2b: sub-itens de Cadastros ──────────────────── */}
      {activeCadastrosItems.map((item, i) => {
        const pos = cadastrosPos[i]
        return (
          <div
            key={item.id}
            className="absolute flex flex-col items-center"
            style={{
              left: '50%', top: '50%',
              transform: isCadastros
                ? `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`
                : 'translate(-50%, -50%)',
              opacity: isCadastros ? 1 : 0,
              pointerEvents: isCadastros ? 'auto' : 'none',
              transition: 'transform 0.48s cubic-bezier(0.34,1.56,0.64,1), opacity 0.25s ease',
              transitionDelay: isCadastros ? `${0.1 + i * 0.08}s` : '0s',
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

      {/* ── Nível 2b: sub-itens de Site (Editar Site + Notícias) ── */}
      {activeSiteItems.map((item, i) => {
        const pos = sitePos[i]
        return (
          <div
            key={item.id}
            className="absolute flex flex-col items-center"
            style={{
              left: '50%', top: '50%',
              transform: isSite
                ? `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`
                : 'translate(-50%, -50%)',
              opacity: isSite ? 1 : 0,
              pointerEvents: isSite ? 'auto' : 'none',
              transition: 'transform 0.48s cubic-bezier(0.34,1.56,0.64,1), opacity 0.25s ease',
              transitionDelay: isSite ? `${0.1 + i * 0.08}s` : '0s',
              zIndex: 20,
            }}
          >
            {item.isGroup ? (
              <button onClick={() => item.groupLevel && setLevel(item.groupLevel)} className={`w-16 h-16 ${ITEM_BTN}`}>
                {item.icon}
              </button>
            ) : (
              <Link href={item.href} onClick={close} className={`w-16 h-16 ${ITEM_BTN}`}>
                {item.icon}
              </Link>
            )}
            <span className={LABEL}>{item.label}</span>
          </div>
        )
      })}

      {/* ── Nível 3: sub-itens de Notícias ──────────────────── */}
      {activeNoticiasItems.map((item, i) => {
        const pos = noticiasPos[i]
        return (
          <div
            key={item.id}
            className="absolute flex flex-col items-center"
            style={{
              left: '50%', top: '50%',
              transform: isNoticias
                ? `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`
                : 'translate(-50%, -50%)',
              opacity: isNoticias ? 1 : 0,
              pointerEvents: isNoticias ? 'auto' : 'none',
              transition: 'transform 0.48s cubic-bezier(0.34,1.56,0.64,1), opacity 0.25s ease',
              transitionDelay: isNoticias ? `${0.1 + i * 0.08}s` : '0s',
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

      {/* ── Nível 3: sub-itens de Cases ──────────────────── */}
      {activeCasesItems.map((item, i) => {
        const pos = casesPos[i]
        return (
          <div
            key={item.id}
            className="absolute flex flex-col items-center"
            style={{
              left: '50%', top: '50%',
              transform: isCases
                ? `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`
                : 'translate(-50%, -50%)',
              opacity: isCases ? 1 : 0,
              pointerEvents: isCases ? 'auto' : 'none',
              transition: 'transform 0.48s cubic-bezier(0.34,1.56,0.64,1), opacity 0.25s ease',
              transitionDelay: isCases ? `${0.1 + i * 0.08}s` : '0s',
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
          if (level === 'closed') openMain()
          else if (level === 'main') close()
        }}
        className="relative z-10 w-[128px] h-[128px] rounded-full bg-white hover:scale-105 focus:outline-none"
        style={{
          opacity: centerGroup ? 0 : 1,
          pointerEvents: centerGroup ? 'none' : 'auto',
          transition: 'opacity 0.25s ease, transform 0.2s ease',
          boxShadow: isMain
            ? '0 0 0 8px rgba(181,40,44,0.18), 0 0 0 16px rgba(181,40,44,0.07), 0 24px 64px rgba(0,0,0,0.35)'
            : '0 8px 40px rgba(0,0,0,0.2)',
        }}
        aria-label={isMain ? 'Fechar menu' : 'Abrir menu'}
      >
        <Image src="/images/logo_santospress.png" alt="Santos Press" fill className="object-contain p-5" />
      </button>

      {/* Click-away */}
      {level !== 'closed' && <div className="fixed inset-0 z-0" onClick={close} />}

      {/* Dica */}
      {!hasOpened && (
        <p className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-gray-400 dark:text-gray-700 text-[10px] whitespace-nowrap pointer-events-none">
          Clique no logo para abrir o menu
        </p>
      )}
    </div>
  )
}
