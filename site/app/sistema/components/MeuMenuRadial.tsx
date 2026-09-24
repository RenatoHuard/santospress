'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

type Level = 'closed' | 'main' | 'meus-dados' | 'site' | 'noticias'

function getPositions(count: number, radius = 165) {
  if (count === 0) return []
  if (count === 1) return [{ x: 0, y: -radius }]
  const spread = Math.min(220, count * 70)
  const step = spread / (count - 1)
  const start = -spread / 2
  return Array.from({ length: count }, (_, i) => {
    const rad = ((start + i * step) * Math.PI) / 180
    return { x: Math.sin(rad) * radius, y: -Math.cos(rad) * radius }
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
  { id: 'editar-site', label: 'Editar Site', href: '/sistema/site', icon: <IconEdit /> },
  { id: 'noticias',    label: 'Notícias',    href: '#',             icon: <IconNoticias />, isGroup: true },
]

const NOTICIAS_ITEMS = [
  { id: 'nova-noticia', label: 'Nova Notícia', href: '/sistema/blog/novo',         icon: <IconNovaNoticia /> },
  { id: 'publicacoes',  label: 'Publicações',  href: '/sistema/blog',              icon: <IconPublicacoes /> },
  { id: 'rascunhos',    label: 'Rascunhos',    href: '/sistema/blog/rascunhos',    icon: <IconRascunho /> },
  { id: 'relatorios',   label: 'Relatórios',   href: '/sistema/blog/relatorios',   icon: <IconRelatorio /> },
]

// ── Componente ───────────────────────────────────────────────────────

export function MeuMenuRadial() {
  const router = useRouter()
  const [level, setLevel] = useState<Level>('closed')
  const [hasOpened, setHasOpened] = useState(false)

  const isMain      = level === 'main'
  const isMeusDados = level === 'meus-dados'
  const isSite      = level === 'site'
  const isNoticias  = level === 'noticias'

  function close()       { setLevel('closed') }
  function openMain()    { setHasOpened(true); setLevel('main') }
  function backToMain()  { setLevel('main') }

  // Itens do nível principal (grupos e folhas)
  const mainItems = [
    { id: 'meus-dados', label: 'Meus Dados', icon: <IconUser />,      largeIcon: <IconUser size={36} />,      href: undefined,             onClick: () => setLevel('meus-dados') },
    { id: 'kanban',     label: 'Kanban',     icon: <IconKanban />,    largeIcon: <IconKanban size={36} />,    href: '/sistema/kanban',     onClick: undefined },
    { id: 'calendario', label: 'Calendário', icon: <IconCalendario />, largeIcon: <IconCalendario size={36} />, href: '/sistema/calendario', onClick: undefined },
    { id: 'site',       label: 'Site',       icon: <IconSite />,      largeIcon: <IconSite size={36} />,      href: undefined,             onClick: () => setLevel('site') },
  ]
  const mainPositions    = getPositions(mainItems.length)
  const meusDadosPos     = getPositions(MEUS_DADOS_ITEMS.length)
  const sitePos          = getPositions(SITE_ITEMS.length)
  const noticiasPos      = getPositions(NOTICIAS_ITEMS.length)

  // Qual grupo está no centro (apenas grupos com sub-nível)
  const centerGroup = isMeusDados ? 'meus-dados' : isSite || isNoticias ? 'site' : null

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
      {MEUS_DADOS_ITEMS.map((item, i) => {
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

      {/* ── Nível 2b: sub-itens de Site (Editar Site + Notícias) ── */}
      {SITE_ITEMS.map((item, i) => {
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
              <button onClick={() => setLevel('noticias')} className={`w-16 h-16 ${ITEM_BTN}`}>
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
      {NOTICIAS_ITEMS.map((item, i) => {
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
