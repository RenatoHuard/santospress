'use client'

import type { HTMLAttributes } from 'react'
import type { Solicitacao } from '../actions/solicitacoes'

// ── Tipos exportados para uso futuro no Kanban ──────────────────────

export interface SolicitacaoCardProps {
  demanda: Solicitacao
  onVista?: (id: string) => void
  // Kanban future props:
  draggable?: boolean
  dragHandleProps?: HTMLAttributes<HTMLDivElement>
  isDragging?: boolean
  compact?: boolean
}

// ── Helpers ─────────────────────────────────────────────────────────

const PRIORIDADE_STYLE: Record<string, string> = {
  baixa:   'bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400',
  media:   'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  alta:    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  urgente: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
}

const PRIORIDADE_LABEL: Record<string, string> = {
  baixa: 'Baixa', media: 'Média', alta: 'Alta', urgente: 'Urgente',
}

function dataRelativa(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'agora'
  if (m < 60) return `${m}min atrás`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h atrás`
  const d = Math.floor(h / 24)
  if (d < 7)  return `${d}d atrás`
  return new Date(iso).toLocaleDateString('pt-BR')
}

// ── Componente ───────────────────────────────────────────────────────

export function SolicitacaoCard({
  demanda,
  onVista,
  draggable = false,
  dragHandleProps,
  isDragging = false,
  compact = false,
}: SolicitacaoCardProps) {
  const isNova = !demanda.visto_em
  const isConcluida = !!demanda.concluida_em

  function handleClick() {
    if (isNova && onVista) onVista(demanda.id)
  }

  return (
    <div
      onClick={handleClick}
      className={`
        group relative bg-white dark:bg-[#111] border rounded-2xl transition-all
        ${isDragging ? 'shadow-2xl scale-[1.02] rotate-1 z-50' : 'shadow-sm hover:shadow-md'}
        ${isNova ? 'border-gold/40 dark:border-gold/30' : 'border-gray-100 dark:border-white/5'}
        ${onVista && isNova ? 'cursor-pointer' : ''}
      `}
    >
      {/* Badge "Nova" */}
      {isNova && (
        <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-white text-[10px] font-bold shadow-lg z-10">
          N
        </span>
      )}

      {/* Drag handle — visível só no modo Kanban */}
      {draggable && (
        <div
          {...dragHandleProps}
          className="absolute top-3 left-1/2 -translate-x-1/2 flex gap-0.5 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-40 transition-opacity"
        >
          {[0, 1, 2].map(i => (
            <div key={i} className="flex flex-col gap-0.5">
              <div className="w-1 h-1 rounded-full bg-gray-400" />
              <div className="w-1 h-1 rounded-full bg-gray-400" />
            </div>
          ))}
        </div>
      )}

      <div className={compact ? 'p-3' : 'p-5'}>
        {/* Topo: cliente + data */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="min-w-0">
            {demanda.cliente_nome && (
              <p className="text-xs font-semibold text-gold truncate">{demanda.cliente_nome}</p>
            )}
            <p className={`font-semibold text-gray-900 dark:text-white leading-snug ${compact ? 'text-sm' : 'text-base'} mt-0.5`}>
              {demanda.titulo}
            </p>
          </div>
          <span className="shrink-0 text-[11px] text-gray-400 dark:text-gray-500 whitespace-nowrap">
            {dataRelativa(demanda.created_at)}
          </span>
        </div>

        {/* Descrição — só no modo normal */}
        {!compact && demanda.descricao && (
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
            {demanda.descricao}
          </p>
        )}

        {/* Rodapé: badges */}
        <div className="flex items-center flex-wrap gap-2">
          {demanda.tipo && (
            <span className="text-[11px] bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 px-2.5 py-0.5 rounded-full">
              {demanda.tipo}
            </span>
          )}
          <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium ${PRIORIDADE_STYLE[demanda.prioridade] ?? PRIORIDADE_STYLE.media}`}>
            {PRIORIDADE_LABEL[demanda.prioridade] ?? demanda.prioridade}
          </span>
          {isConcluida && (
            <span className="text-[11px] bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 px-2.5 py-0.5 rounded-full font-medium ml-auto">
              Concluída
            </span>
          )}
          {!isConcluida && !isNova && (
            <span className="text-[11px] bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 px-2.5 py-0.5 rounded-full font-medium ml-auto">
              Em andamento
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
