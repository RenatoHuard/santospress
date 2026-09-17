'use client'

import { useState } from 'react'
import { type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

export interface CornerMenuItem {
  id: string
  label: string
  href: string
  exact?: boolean
  icon: ReactNode
}

interface Props {
  /** Current section items (deepest level). */
  items: CornerMenuItem[]
  /**
   * One level up in the menu tree.
   * When provided, "Voltar" first switches to this level;
   * from here "Voltar" navigates to backHref.
   */
  parentItems?: CornerMenuItem[]
  /** Final back destination (root of this subtree). */
  backHref: string
  backLabel?: string
}

// Half-circle: items spread -80° → +80° from horizontal right axis
// x = cos(θ)*r → rightward   |   y = sin(θ)*r → downward
function getPositions(count: number, radius = 140) {
  if (count === 0) return []
  const start = -80
  const end   =  80
  if (count === 1) return [{ x: radius, y: 0 }]
  return Array.from({ length: count }, (_, i) => {
    const r = (start + (i * (end - start)) / (count - 1)) * (Math.PI / 180)
    return { x: Math.cos(r) * radius, y: Math.sin(r) * radius }
  })
}

// Trigger center: 8px left margin + 28px (half of 56px button)
const TX = 36

const BackIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
)

interface RenderItem {
  id: string
  label: string
  href: string
  icon: ReactNode
  isCurrent: boolean
  isBack: boolean
}

export function CornerRadialMenu({ items, parentItems, backHref, backLabel = 'Voltar' }: Props) {
  const [open, setOpen] = useState(false)
  const [showParent, setShowParent] = useState(false)
  const pathname = usePathname()
  const router   = useRouter()

  function close() {
    setOpen(false)
    setShowParent(false)
  }

  function handleBack() {
    if (!showParent && parentItems && parentItems.length > 0) {
      // Go up one level inside the menu — no navigation
      setShowParent(true)
    } else {
      router.push(backHref)
      close()
    }
  }

  // Decide which item list to display
  const displayItems = showParent ? (parentItems ?? items) : items

  const currentIdx = displayItems.findIndex(item =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href),
  )

  // Build arc: current first (top), others, Voltar last (bottom)
  const arcItems: RenderItem[] = [
    ...(currentIdx >= 0
      ? [{ ...displayItems[currentIdx], isCurrent: true,  isBack: false }]
      : []),
    ...displayItems
      .filter((_, i) => i !== currentIdx)
      .map(it => ({ ...it, isCurrent: false, isBack: false })),
    {
      id: '__back',
      label: backLabel,
      href: '#',
      icon: <BackIcon />,
      isCurrent: false,
      isBack: true,
    },
  ]

  const positions = getPositions(arcItems.length)

  const itemBtnCls = (isCurrent: boolean) =>
    [
      'w-12 h-12 rounded-full flex items-center justify-center shadow-xl border-2 transition-all duration-200',
      isCurrent
        ? 'bg-gold border-gold text-white scale-110'
        : 'bg-white dark:bg-[#1c1c1c] border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-300 hover:bg-gold hover:border-gold hover:text-white hover:scale-110',
    ].join(' ')

  return (
    <>
      {/* Arc items — fixed, vertically centered via calc(50vh) */}
      {arcItems.map((item, i) => {
        const p = positions[i]

        return (
          <div
            key={`${showParent ? 'p' : 'c'}-${item.id}`}
            className="fixed z-40 flex flex-col items-center"
            style={{
              left: TX + p.x - 24,
              top: `calc(50vh + ${p.y - 24}px)`,
              // Collapse: translate back to trigger center
              transform: open ? 'translate(0,0)' : `translate(${-p.x}px,${-p.y}px)`,
              opacity: open ? 1 : 0,
              pointerEvents: open ? 'auto' : 'none',
              transition: 'transform 0.44s cubic-bezier(0.34,1.56,0.64,1), opacity 0.22s ease',
              transitionDelay: open ? `${i * 0.055}s` : '0s',
            }}
          >
            {item.isBack ? (
              <button onClick={handleBack} className={itemBtnCls(false)}>
                {item.icon}
              </button>
            ) : (
              <Link href={item.href} onClick={close} className={itemBtnCls(item.isCurrent)}>
                {item.icon}
              </Link>
            )}
            <span
              className={[
                'mt-1.5 text-[9px] font-bold uppercase tracking-widest whitespace-nowrap select-none',
                item.isCurrent ? 'text-gold' : 'text-gray-600 dark:text-gray-200',
              ].join(' ')}
            >
              {item.label}
            </span>
          </div>
        )
      })}

      {/* Trigger — left edge, vertically centered */}
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
          width: 56,
          height: 56,
          left: TX - 28,
          top: 'calc(50vh - 28px)',
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

      {/* Background disk — fundo sólido atrás dos itens para não vazar texto da página */}
      {open && (
        <div
          className="fixed z-[35] bg-white dark:bg-[#111111] rounded-full pointer-events-none"
          style={{
            width: 450,
            height: 450,
            left: TX - 225,
            top: 'calc(50vh - 225px)',
          }}
        />
      )}

      {/* Backdrop */}
      {open && <div className="fixed inset-0 z-30" onClick={close} />}
    </>
  )
}
