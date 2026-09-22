'use client'

import { useMemo } from 'react'
import type { CalendarioCard } from '../actions/kanban'

const DAY_W  = 30   // px per day
const ROW_H  = 44   // px per row
const LEFT_W = 252  // px for left label column

const PRIORIDADE_BAR: Record<string, string> = {
  baixa:   'bg-gray-300 dark:bg-gray-600',
  media:   'bg-blue-400',
  alta:    'bg-amber-400',
  urgente: 'bg-red-500',
}

function toDay(iso: string): Date {
  const [y, m, d] = iso.split('T')[0].split('-').map(Number)
  return new Date(y, m - 1, d)
}

function diffDays(a: Date, b: Date): number {
  return Math.round((a.getTime() - b.getTime()) / 86400000)
}

function addDays(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
}

interface Props {
  cards: CalendarioCard[]
  rangeStart: Date
  rangeEnd: Date
  onCardClick: (card: CalendarioCard) => void
}

export function CalendarioGantt({ cards, rangeStart, rangeEnd, onCardClick }: Props) {
  const totalDays = diffDays(rangeEnd, rangeStart) + 1
  const totalW    = totalDays * DAY_W

  const today = useMemo(() => {
    const n = new Date()
    return new Date(n.getFullYear(), n.getMonth(), n.getDate())
  }, [])
  const todayX = diffDays(today, rangeStart) * DAY_W + DAY_W / 2
  const showToday = todayX >= 0 && todayX <= totalW

  // Cards com prazo, agrupados por quadro
  const groups = useMemo(() => {
    const sorted = cards
      .filter(c => c.prazo)
      .sort((a, b) => new Date(a.prazo!).getTime() - new Date(b.prazo!).getTime())
    const map = new Map<string, { nome: string | null; cards: CalendarioCard[] }>()
    for (const card of sorted) {
      const key = card.quadro_id || '__'
      if (!map.has(key)) map.set(key, { nome: card.quadro_nome, cards: [] })
      map.get(key)!.cards.push(card)
    }
    return [...map.values()]
  }, [cards])

  // Cabeçalho de meses
  const monthSegs = useMemo(() => {
    const segs: { label: string; x: number; w: number }[] = []
    let cur = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), 1)
    while (cur <= rangeEnd) {
      const end = new Date(cur.getFullYear(), cur.getMonth() + 1, 0)
      const s   = Math.max(0, diffDays(cur, rangeStart))
      const e   = Math.min(totalDays - 1, diffDays(end, rangeStart))
      if (e >= s) segs.push({
        label: cur.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
        x: s * DAY_W,
        w: (e - s + 1) * DAY_W,
      })
      cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1)
    }
    return segs
  }, [rangeStart, rangeEnd, totalDays])

  // Ticks de semana (cada 7 dias + 1º de cada mês)
  const weekTicks = useMemo(() => {
    const ticks: { label: string; x: number; isMonth: boolean }[] = []
    for (let i = 0; i < totalDays; i++) {
      const d = addDays(rangeStart, i)
      if (d.getDate() === 1 || i % 7 === 0) {
        ticks.push({ label: String(d.getDate()), x: i * DAY_W, isMonth: d.getDate() === 1 })
      }
    }
    return ticks
  }, [rangeStart, totalDays])

  function getBar(card: CalendarioCard) {
    const start = toDay(card.created_at)
    const end   = toDay(card.prazo!)
    const s = diffDays(start, rangeStart)
    const e = diffDays(end, rangeStart)
    if (e < 0 || s >= totalDays) return null
    const clampS = Math.max(0, s)
    const clampE = Math.min(totalDays - 1, e)
    return {
      x: clampS * DAY_W,
      w: Math.max(DAY_W * 0.8, (clampE - clampS + 1) * DAY_W - 4),
      truncLeft:  s < 0,
      truncRight: e >= totalDays,
      isConcluida: !!card.concluida_em,
      isOverdue:   !card.concluida_em && toDay(card.prazo!) < today,
    }
  }

  const totalCards = groups.reduce((acc, g) => acc + g.cards.length, 0)

  if (totalCards === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
        Nenhum card com prazo definido neste período
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto bg-white dark:bg-[#111]">
      <div style={{ minWidth: LEFT_W + totalW }}>

        {/* ── Cabeçalho sticky ── */}
        <div className="sticky top-0 z-20 flex border-b-2 border-gray-200 dark:border-white/10 bg-white dark:bg-[#111]">
          {/* Célula esquerda */}
          <div
            className="sticky left-0 z-30 shrink-0 bg-white dark:bg-[#111] border-r border-gray-200 dark:border-white/8 px-4 flex items-end pb-2"
            style={{ width: LEFT_W }}
          >
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Demanda</span>
          </div>

          {/* Timeline header */}
          <div className="relative overflow-hidden" style={{ width: totalW, height: 52 }}>
            {/* Meses */}
            {monthSegs.map(seg => (
              <div
                key={seg.label}
                className="absolute top-0 h-6 flex items-center px-2 border-r border-gray-100 dark:border-white/5"
                style={{ left: seg.x, width: seg.w }}
              >
                <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 capitalize truncate">
                  {seg.label}
                </span>
              </div>
            ))}

            {/* Semanas / dias */}
            {weekTicks.map((t, i) => (
              <div
                key={i}
                className={`absolute top-6 bottom-0 flex items-center ${t.isMonth ? 'border-l border-gray-200 dark:border-white/8' : 'border-l border-gray-100 dark:border-white/4'}`}
                style={{ left: t.x }}
              >
                <span className={`pl-1 text-[9px] ${t.isMonth ? 'font-bold text-gray-500 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}`}>
                  {t.label}
                </span>
              </div>
            ))}

            {/* Hoje */}
            {showToday && (
              <div className="absolute top-0 bottom-0 w-[2px] bg-gold" style={{ left: todayX - 1 }} />
            )}
          </div>
        </div>

        {/* ── Linhas por grupo ── */}
        {groups.map((group, gi) => (
          <div key={gi}>
            {/* Group header */}
            <div
              className="flex border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-[#0d0d0d]"
              style={{ height: 28 }}
            >
              <div
                className="sticky left-0 z-10 shrink-0 bg-gray-50 dark:bg-[#0d0d0d] border-r border-gray-200 dark:border-white/8 flex items-center px-4 gap-2"
                style={{ width: LEFT_W }}
              >
                <svg className="w-3 h-3 text-gold shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6z" />
                </svg>
                <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide truncate">
                  {group.nome ?? 'Sem quadro'}
                </span>
                <span className="ml-auto text-[10px] text-gray-400">{group.cards.length}</span>
              </div>
              <div style={{ width: totalW }} />
            </div>

            {/* Card rows */}
            {group.cards.map((card, ci) => {
              const bar = getBar(card)
              const isEven = ci % 2 === 0
              const rowBg = isEven
                ? 'bg-white dark:bg-[#111]'
                : 'bg-gray-50/70 dark:bg-[#0f0f0f]'

              return (
                <div
                  key={card.id}
                  className={`flex items-center border-b border-gray-100 dark:border-white/5 group ${rowBg}`}
                  style={{ height: ROW_H }}
                >
                  {/* Label */}
                  <div
                    className={`sticky left-0 z-10 shrink-0 flex items-center gap-2 px-4 h-full border-r border-gray-200 dark:border-white/8 ${rowBg}`}
                    style={{ width: LEFT_W }}
                  >
                    <div
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        PRIORIDADE_BAR[card.prioridade]?.replace('bg-', 'bg-') ?? 'bg-gray-300'
                      }`}
                    />
                    <span className={`text-sm truncate flex-1 ${card.concluida_em ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-100'}`}>
                      {card.titulo}
                    </span>
                    {card.responsavel_nome && (
                      <span className="shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-navy text-white text-[8px] font-bold">
                        {card.responsavel_nome.split(' ').slice(0, 2).map((p: string) => p[0]).join('').toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Timeline row */}
                  <div className="relative" style={{ width: totalW, height: ROW_H }}>
                    {/* Today line */}
                    {showToday && (
                      <div
                        className="absolute top-0 bottom-0 w-px bg-gold/20"
                        style={{ left: todayX - 0.5 }}
                      />
                    )}

                    {/* Week grid lines */}
                    {weekTicks.map((t, ti) => (
                      <div
                        key={ti}
                        className={`absolute top-0 bottom-0 w-px ${t.isMonth ? 'bg-gray-200 dark:bg-white/8' : 'bg-gray-100 dark:bg-white/4'}`}
                        style={{ left: t.x }}
                      />
                    ))}

                    {/* Gantt bar */}
                    {bar && (
                      <button
                        onClick={() => onCardClick(card)}
                        className={`absolute top-1/2 -translate-y-1/2 rounded-md h-7 flex items-center overflow-hidden transition-all hover:brightness-110 hover:shadow-md ${
                          bar.isConcluida
                            ? 'bg-emerald-400 dark:bg-emerald-600'
                            : bar.isOverdue
                            ? 'bg-red-400 dark:bg-red-600'
                            : (PRIORIDADE_BAR[card.prioridade] ?? PRIORIDADE_BAR.media)
                        } ${bar.truncLeft ? 'rounded-l-none border-l-2 border-white/40' : ''} ${bar.truncRight ? 'rounded-r-none' : ''}`}
                        style={{ left: bar.x + 2, width: bar.w }}
                        title={`${card.titulo} — ${card.created_at.split('T')[0]} → ${card.prazo}`}
                      >
                        <span className="px-2 text-[11px] text-white font-medium truncate leading-none">
                          {card.titulo}
                        </span>
                        {bar.isConcluida && (
                          <svg className="w-3 h-3 text-white/80 ml-auto mr-1.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
