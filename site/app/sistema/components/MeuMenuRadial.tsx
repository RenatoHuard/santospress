'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

type Level = 'closed' | 'main' | 'meus-dados'

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

const IconUser = ({ size = 24 }: { size?: number }) => (
  <svg style={{ width: size, height: size }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
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

const IconBack = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
)

const subItems = [
  { id: 'visualizar',  label: 'Visualizar',      href: '/sistema/perfil?modo=ver',    icon: <IconEye /> },
  { id: 'atualizar',   label: 'Atualizar Dados',  href: '/sistema/perfil?modo=editar', icon: <IconEdit /> },
]
const subPositions = getPositions(subItems.length)

export function MeuMenuRadial() {
  const [level, setLevel] = useState<Level>('closed')
  const [hasOpened, setHasOpened] = useState(false)

  const isMain      = level === 'main'
  const isMeusDados = level === 'meus-dados'

  function close()      { setLevel('closed') }
  function openMain()   { setHasOpened(true); setLevel('main') }
  function openSub()    { setLevel('meus-dados') }
  function backToMain() { setLevel('main') }

  // Posição do botão "Meus Dados" no nível 1 (único item, vai pra cima)
  const mainPos = { x: 0, y: -165 }

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
            width: size, height: size,
            borderColor: `rgba(181,40,44,${0.22 - i * 0.06})`,
            animationDelay: `${i * 1.3}s`,
            animationDuration: `${4 + i}s`,
          }}
        />
      ))}

      {/* ── Nível 1: botão "Meus Dados" ─────────────────────── */}
      <div
        className="absolute flex flex-col items-center"
        style={{
          left: '50%', top: '50%',
          transform: isMeusDados
            ? 'translate(-50%, -50%)'
            : isMain
            ? `translate(calc(-50% + ${mainPos.x}px), calc(-50% + ${mainPos.y}px))`
            : 'translate(-50%, -50%)',
          opacity: (isMain || isMeusDados) ? 1 : 0,
          pointerEvents: (isMain || isMeusDados) ? 'auto' : 'none',
          transition: 'transform 0.48s cubic-bezier(0.34,1.56,0.64,1), opacity 0.28s ease',
          zIndex: isMeusDados ? 10 : 20,
        }}
      >
        <button
          onClick={() => isMeusDados ? backToMain() : openSub()}
          className={ITEM_BTN}
          style={{
            width:  isMeusDados ? 128 : 64,
            height: isMeusDados ? 128 : 64,
            transition: 'width 0.38s cubic-bezier(0.34,1.56,0.64,1), height 0.38s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s',
            ...(isMeusDados ? CENTER_STYLE : {}),
          }}
        >
          {isMeusDados ? (
            <div className="relative flex items-center justify-center w-full h-full">
              <span className="text-gray-600"><IconUser size={36} /></span>
              <span className="absolute -top-1 -left-1 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 shadow" title="Voltar">
                <IconBack />
              </span>
            </div>
          ) : (
            <IconUser />
          )}
        </button>
        {!isMeusDados && <span className={LABEL}>Meus Dados</span>}
      </div>

      {/* ── Nível 2: sub-itens de Meus Dados ────────────────── */}
      {subItems.map((item, i) => {
        const pos = subPositions[i]
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

      {/* ── Botão central (logo) ─────────────────────────────── */}
      <button
        onClick={() => {
          if (level === 'closed' || level === 'main') {
            level === 'closed' ? openMain() : close()
          }
        }}
        className="relative z-10 w-[128px] h-[128px] rounded-full bg-white hover:scale-105 focus:outline-none"
        style={{
          opacity: isMeusDados ? 0 : 1,
          pointerEvents: isMeusDados ? 'none' : 'auto',
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
