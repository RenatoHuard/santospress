'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import {
  getCalendarioData, getUsuarioByAuthId,
  type CalendarioCard, type CalendarioData, type Etiqueta, type KanbanCard, type UsuarioSimples,
} from '../actions/kanban'
import { CardDetalhes } from '../components/kanban/CardDetalhes'
import { CalendarioGantt } from './CalendarioGantt'

type ViewMode = 'mes' | 'projeto'

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const DIAS  = ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom']

const PRIORIDADE_BORDER: Record<string, string> = {
  baixa:   'border-l-gray-300',
  media:   'border-l-blue-400',
  alta:    'border-l-amber-400',
  urgente: 'border-l-red-500',
}

function isoToLocalDate(iso: string): string {
  return iso.split('T')[0]
}

export default function CalendarioPage() {
  const [data, setData]             = useState<CalendarioData | null>(null)
  const [loading, setLoading]       = useState(true)
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [viewMode, setViewMode]         = useState<ViewMode>('mes')
  const [selectedCard, setSelectedCard] = useState<CalendarioCard | null>(null)
  const [authUserId, setAuthUserId]     = useState<string | null>(null)
  const [currentUser, setCurrentUser]   = useState<UsuarioSimples | null>(null)

  // Gantt range: 4 months starting from prev month
  const [ganttStart, setGanttStart] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth() - 1, 1)
  })
  const ganttEnd = useMemo(() => {
    return new Date(ganttStart.getFullYear(), ganttStart.getMonth() + 4, 0)
  }, [ganttStart])

  function ganttPrev() { setGanttStart(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)) }
  function ganttNext() { setGanttStart(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)) }

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setAuthUserId(user.id)
        getUsuarioByAuthId(user.id).then(u => setCurrentUser(u))
      }
    })
    getCalendarioData().then(d => { setData(d); setLoading(false) })
  }, [])

  const isAdminGestor = !!(currentUser?.roles?.includes('admin') || currentUser?.roles?.includes('gestor') || currentUser?.roles?.includes('rh'))

  const visibleCards = useMemo(() => {
    if (!data) return []
    if (isAdminGestor || !currentUser) return data.cards
    return data.cards.filter(c => c.responsavel_id === currentUser.id)
  }, [data, isAdminGestor, currentUser])

  const cardsByDate = useMemo(() => {
    const map: Record<string, CalendarioCard[]> = {}
    for (const card of visibleCards) {
      if (!card.prazo) continue
      const key = isoToLocalDate(card.prazo)
      if (!map[key]) map[key] = []
      map[key].push(card)
    }
    return map
  }, [visibleCards])

  const { year, month, calendarDays } = useMemo(() => {
    const y = currentMonth.getFullYear()
    const m = currentMonth.getMonth()
    const firstDay = new Date(y, m, 1)
    const startDow = (firstDay.getDay() + 6) % 7 // Mon=0
    const daysInMonth = new Date(y, m + 1, 0).getDate()
    const totalCells  = Math.ceil((startDow + daysInMonth) / 7) * 7
    const days: Array<{ date: Date | null; key: string | null; isCurrentMonth: boolean }> = []
    for (let i = 0; i < totalCells; i++) {
      const dayNum = i - startDow + 1
      if (dayNum < 1 || dayNum > daysInMonth) {
        days.push({ date: null, key: null, isCurrentMonth: false })
      } else {
        const date = new Date(y, m, dayNum)
        const key  = `${y}-${String(m + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
        days.push({ date, key, isCurrentMonth: true })
      }
    }
    return { year: y, month: m, calendarDays: days }
  }, [currentMonth])

  const todayKey = useMemo(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  }, [])

  function prevMonth() { setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)) }
  function nextMonth() { setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)) }
  function goToday() {
    const now = new Date()
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1))
    setGanttStart(new Date(now.getFullYear(), now.getMonth() - 1, 1))
  }

  function handleCardUpdate(cardId: string, patch: Partial<KanbanCard>) {
    setData(prev => {
      if (!prev) return prev
      return { ...prev, cards: prev.cards.map(c => c.id === cardId ? { ...c, ...patch } as CalendarioCard : c) }
    })
    setSelectedCard(prev => prev?.id === cardId ? { ...prev, ...patch } as CalendarioCard : prev)
  }

  function handleCardDelete(cardId: string) {
    setData(prev => {
      if (!prev) return prev
      return { ...prev, cards: prev.cards.filter(c => c.id !== cardId) }
    })
    setSelectedCard(null)
  }

  function handleEtiquetaBoardChange(etiquetas: Etiqueta[]) {
    if (!selectedCard) return
    setData(prev => {
      if (!prev) return prev
      return {
        ...prev,
        etiquetasByQuadro: { ...prev.etiquetasByQuadro, [selectedCard.quadro_id]: etiquetas },
      }
    })
  }

  const totalCards = visibleCards.length

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Page header */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-100 dark:border-white/5 bg-white dark:bg-[#111] shrink-0">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">Calendário</h1>
        </div>
        {!loading && (
          <span className="text-xs text-gray-400 dark:text-gray-500">{totalCards} cards com prazo</span>
        )}

        {/* View toggle */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-white/5 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('mes')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              viewMode === 'mes'
                ? 'bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
            Mês
          </button>
          <button
            onClick={() => setViewMode('projeto')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              viewMode === 'projeto'
                ? 'bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
            </svg>
            Projeto
          </button>
        </div>

        <Link
          href="/sistema/kanban"
          className="ml-auto flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gold dark:hover:text-gold transition-colors px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/8 hover:border-gold/40"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
          </svg>
          Kanban
        </Link>
      </div>

      {/* Sub-navigation (month calendar or gantt period) */}
      <div className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-[#111] border-b border-gray-100 dark:border-white/5 shrink-0">
        <button
          onClick={viewMode === 'mes' ? prevMonth : ganttPrev}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <h2 className="text-base font-semibold text-gray-900 dark:text-white min-w-[220px] text-center">
          {viewMode === 'mes'
            ? `${MESES[month]} ${year}`
            : `${ganttStart.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })} — ${ganttEnd.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}`
          }
        </h2>

        <button
          onClick={viewMode === 'mes' ? nextMonth : ganttNext}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <button
          onClick={goToday}
          className="ml-2 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gold dark:hover:text-gold px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/8 hover:border-gold/40 transition-colors"
        >
          Hoje
        </button>
      </div>

      {/* Views */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-7 h-7 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      ) : viewMode === 'projeto' ? (
        <CalendarioGantt
          cards={visibleCards}
          rangeStart={ganttStart}
          rangeEnd={ganttEnd}
          onCardClick={setSelectedCard}
        />
      ) : (
        <div className="flex-1 overflow-auto bg-gray-50 dark:bg-[#0a0a0a] p-4">
          <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-white/5 rounded-xl overflow-hidden border border-gray-200 dark:border-white/5">
            {/* Day headers */}
            {DIAS.map(d => (
              <div key={d} className="bg-white dark:bg-[#111] px-3 py-2 text-center text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                {d}
              </div>
            ))}

            {/* Day cells */}
            {calendarDays.map((cell, idx) => {
              const isToday   = cell.key === todayKey
              const dayCards  = cell.key ? (cardsByDate[cell.key] ?? []) : []
              const overflow  = dayCards.length > 3
              const visible   = dayCards.slice(0, 3)
              const extraCount = dayCards.length - 3

              return (
                <div
                  key={idx}
                  className={`bg-white dark:bg-[#111] min-h-[100px] p-1.5 flex flex-col gap-1 ${
                    !cell.isCurrentMonth ? 'opacity-30' : ''
                  }`}
                >
                  {cell.date && (
                    <span className={`self-start text-[11px] font-semibold w-6 h-6 flex items-center justify-center rounded-full ${
                      isToday
                        ? 'bg-gold text-white'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {cell.date.getDate()}
                    </span>
                  )}

                  {visible.map(card => {
                    const isConcluida = !!card.concluida_em
                    const prazoDate = card.prazo ? new Date(card.prazo.split('T')[0]) : null
                    const now = new Date(); now.setHours(0,0,0,0)
                    const isOverdue = prazoDate ? prazoDate < now && !isConcluida : false

                    return (
                      <button
                        key={card.id}
                        onClick={() => setSelectedCard(card)}
                        className={`w-full text-left text-[10px] leading-tight px-1.5 py-1 rounded border-l-2 truncate transition-colors ${
                          isConcluida
                            ? 'line-through text-gray-400 dark:text-gray-500 border-l-gray-200 bg-gray-50 dark:bg-white/5'
                            : isOverdue
                            ? 'text-red-700 dark:text-red-400 border-l-red-500 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/40'
                            : `text-gray-700 dark:text-gray-200 ${PRIORIDADE_BORDER[card.prioridade] ?? PRIORIDADE_BORDER.media} bg-white dark:bg-[#1a1a1a] hover:bg-gray-50 dark:hover:bg-white/5`
                        }`}
                        title={card.titulo}
                      >
                        {card.titulo}
                      </button>
                    )
                  })}

                  {overflow && (
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 px-1.5 font-medium">
                      +{extraCount} mais
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* CardDetalhes modal */}
      {selectedCard && data && (
        <CardDetalhes
          card={selectedCard}
          colunaNome={selectedCard.coluna_nome ?? undefined}
          boardLink={selectedCard.quadro_id ? `/sistema/kanban/${selectedCard.quadro_id}` : undefined}
          quadroId={selectedCard.quadro_id}
          etiquetasBoard={data.etiquetasByQuadro[selectedCard.quadro_id] ?? []}
          usuarios={data.usuarios}
          clientes={data.clientes}
          currentUser={currentUser}
          authUserId={authUserId}
          onClose={() => setSelectedCard(null)}
          onUpdate={handleCardUpdate}
          onDelete={handleCardDelete}
          onEtiquetaBoardChange={handleEtiquetaBoardChange}
        />
      )}
    </div>
  )
}
