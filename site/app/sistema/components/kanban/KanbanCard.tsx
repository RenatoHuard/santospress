'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { KanbanCard as KanbanCardType } from '../../actions/kanban'

const PRIORIDADE_DOT: Record<string, string> = {
  baixa:   'bg-gray-300 dark:bg-gray-600',
  media:   'bg-blue-400',
  alta:    'bg-amber-400',
  urgente: 'bg-red-500',
}

const PRIORIDADE_LABEL: Record<string, string> = {
  baixa: 'Baixa', media: 'Média', alta: 'Alta', urgente: 'Urgente',
}

function dataRelativa(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const d = Math.floor(diff / 86400000)
  if (d < 1) return 'hoje'
  if (d === 1) return 'ontem'
  if (d < 7) return `${d}d atrás`
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

function prazoLabel(iso: string): { label: string; overdue: boolean } {
  const date = new Date(iso)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  date.setHours(0, 0, 0, 0)
  const diff = Math.floor((date.getTime() - now.getTime()) / 86400000)
  const overdue = diff < 0
  const label = diff === 0 ? 'Hoje' : diff === 1 ? 'Amanhã' : diff === -1 ? 'Ontem' :
    overdue ? `${Math.abs(diff)}d atraso` : `${diff}d`
  return { label, overdue }
}

interface Props {
  card: KanbanCardType
  onClick: () => void
  overlay?: boolean
}

export function KanbanCard({ card, onClick, overlay = false }: Props) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id, data: { type: 'card', card } })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  if (isDragging && !overlay) {
    return (
      <div ref={setNodeRef} style={style} className="h-[72px] rounded-xl border-2 border-dashed border-gold/30 bg-gold/5" />
    )
  }

  const isConcluida = !!card.concluida_em
  const prazo = card.prazo ? prazoLabel(card.prazo) : null

  return (
    <div
      ref={overlay ? undefined : setNodeRef}
      style={overlay ? undefined : style}
      {...(overlay ? {} : { ...attributes, ...listeners })}
      className={`
        group relative bg-white dark:bg-[#1a1a1a] border rounded-xl p-3 cursor-grab active:cursor-grabbing
        hover:border-gold/40 hover:shadow-md transition-all select-none
        ${overlay ? 'shadow-2xl rotate-2 scale-105 border-gold/60 cursor-grabbing' : isConcluida ? 'border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/40 dark:bg-emerald-950/20' : 'border-gray-100 dark:border-white/8 shadow-sm'}
      `}
      onClick={overlay ? undefined : onClick}
    >
      {/* Concluded badge */}
      {isConcluida && (
        <span className="absolute top-2 right-2 flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-white">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </span>
      )}

      {/* Title row */}
      <div className="flex items-start gap-2">
        <p className={`text-sm font-medium leading-snug flex-1 pr-4 ${isConcluida ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white'}`}>
          {card.titulo}
        </p>
      </div>

      {/* Etiquetas */}
      {card.etiquetas && card.etiquetas.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2 ml-5">
          {card.etiquetas.map(e => (
            <span
              key={e.id}
              className="h-2 w-8 rounded-full"
              style={{ backgroundColor: e.cor }}
              title={e.nome ?? e.cor}
            />
          ))}
        </div>
      )}

      {/* Cliente */}
      {card.cliente_nome && (
        <p className="text-[11px] text-gold font-medium mt-1.5 ml-5 truncate">{card.cliente_nome}</p>
      )}
      {!card.cliente_nome && card.origem === 'interno' && (
        <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1.5 ml-5">Interno</p>
      )}

      {/* Footer badges */}
      <div className="flex items-center gap-2 mt-2.5 ml-5 flex-wrap">
        <span className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
          <span className={`w-2 h-2 rounded-full shrink-0 ${PRIORIDADE_DOT[card.prioridade] ?? PRIORIDADE_DOT.media}`} />
          {PRIORIDADE_LABEL[card.prioridade] ?? card.prioridade}
        </span>

        {card.tipo && (
          <span className="text-[11px] bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">
            {card.tipo}
          </span>
        )}

        {prazo && (
          <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${prazo.overdue ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400'}`}>
            {prazo.label}
          </span>
        )}

        {card.responsavel_nome && (
          <span className="ml-auto shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-navy/80 text-white text-[9px] font-bold">
            {card.responsavel_nome.split(' ').map((p: string) => p[0]).slice(0, 2).join('').toUpperCase()}
          </span>
        )}
      </div>
    </div>
  )
}
