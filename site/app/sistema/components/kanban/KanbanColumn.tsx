'use client'

import { useState, useRef } from 'react'
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { KanbanCard } from './KanbanCard'
import { renomearColuna, deletarColuna, criarCard, type KanbanColuna, type KanbanCard as KanbanCardType, type KanbanData } from '../../actions/kanban'

interface Props {
  coluna: KanbanColuna
  quadroId: string
  usuarios: KanbanData['usuarios']
  clientes: KanbanData['clientes']
  onCardClick: (card: KanbanCardType) => void
  onAddCard: (colunaId: string, card: KanbanCardType) => void
  onDeleteColuna: (colunaId: string) => void
  onRenameColuna: (colunaId: string, nome: string) => void
}

export function KanbanColumn({
  coluna, quadroId, usuarios, clientes,
  onCardClick, onAddCard, onDeleteColuna, onRenameColuna,
}: Props) {
  const [editingNome, setEditingNome] = useState(false)
  const [nomeInput, setNomeInput] = useState(coluna.nome)
  const [addingCard, setAddingCard] = useState(false)
  const [novoCardTitulo, setNovoCardTitulo] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const addInputRef = useRef<HTMLInputElement>(null)

  // Column is sortable
  const {
    setNodeRef: setSortRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: coluna.id, data: { type: 'coluna', colunaId: coluna.id } })

  // Column cards area is a drop target
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `col-drop-${coluna.id}`,
    data: { type: 'coluna', colunaId: coluna.id },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  async function handleRenameBlur() {
    setEditingNome(false)
    if (nomeInput.trim() && nomeInput !== coluna.nome) {
      onRenameColuna(coluna.id, nomeInput.trim())
      await renomearColuna(coluna.id, nomeInput.trim())
    } else {
      setNomeInput(coluna.nome)
    }
  }

  async function handleAddCard() {
    const titulo = novoCardTitulo.trim()
    if (!titulo) { setAddingCard(false); return }
    const card = await criarCard(coluna.id, quadroId, { titulo })
    if (card) onAddCard(coluna.id, card)
    setNovoCardTitulo('')
    setAddingCard(false)
  }

  async function handleDelete() {
    await deletarColuna(coluna.id)
    onDeleteColuna(coluna.id)
  }

  return (
    <div
      ref={setSortRef}
      style={style}
      className="flex flex-col shrink-0 w-72 rounded-2xl bg-gray-100 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/5"
    >
      {/* Column header */}
      <div className="flex items-center gap-2 px-3 pt-3 pb-2">
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 transition-colors shrink-0"
          title="Arrastar coluna"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
          </svg>
        </div>

        {editingNome ? (
          <input
            autoFocus
            className="flex-1 bg-white dark:bg-[#111] border border-gold/40 rounded-lg px-2 py-1 text-sm font-semibold text-gray-900 dark:text-white outline-none"
            value={nomeInput}
            onChange={e => setNomeInput(e.target.value)}
            onBlur={handleRenameBlur}
            onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); if (e.key === 'Escape') { setNomeInput(coluna.nome); setEditingNome(false) } }}
          />
        ) : (
          <button
            className="flex-1 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white transition-colors truncate"
            onDoubleClick={() => setEditingNome(true)}
            title="Duplo clique para renomear"
          >
            {coluna.nome}
          </button>
        )}

        <span className="shrink-0 text-[11px] text-gray-400 dark:text-gray-500 font-medium min-w-[20px] text-center">
          {coluna.cards.length}
        </span>

        {/* Delete column */}
        {confirmDelete ? (
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => setConfirmDelete(false)} className="text-[10px] text-gray-400 hover:text-gray-600 px-1.5 py-0.5 rounded bg-gray-200 dark:bg-white/5">✕</button>
            <button onClick={handleDelete} className="text-[10px] text-white bg-red-500 hover:bg-red-600 px-1.5 py-0.5 rounded font-semibold">✓</button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="shrink-0 text-gray-300 dark:text-gray-600 hover:text-red-400 transition-colors"
            title="Excluir coluna"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Cards area */}
      <div
        ref={setDropRef}
        className={`flex-1 px-2 pb-2 space-y-2 min-h-[48px] rounded-xl transition-colors ${isOver ? 'bg-gold/5 dark:bg-gold/5' : ''}`}
      >
        <SortableContext items={coluna.cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
          {coluna.cards.map(card => (
            <KanbanCard
              key={card.id}
              card={card}
              onClick={() => onCardClick(card)}
            />
          ))}
        </SortableContext>
      </div>

      {/* Add card */}
      <div className="px-2 pb-2">
        {addingCard ? (
          <div className="bg-white dark:bg-[#111] rounded-xl p-2 space-y-2 border border-gray-100 dark:border-white/8">
            <input
              ref={addInputRef}
              autoFocus
              className="w-full text-sm bg-transparent text-gray-900 dark:text-white placeholder:text-gray-400 outline-none"
              placeholder="Título do card..."
              value={novoCardTitulo}
              onChange={e => setNovoCardTitulo(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAddCard(); if (e.key === 'Escape') { setAddingCard(false); setNovoCardTitulo('') } }}
            />
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddCard}
                className="text-xs bg-gold text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-gold/90 transition-colors"
              >
                Adicionar
              </button>
              <button
                onClick={() => { setAddingCard(false); setNovoCardTitulo('') }}
                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => { setAddingCard(true); setTimeout(() => addInputRef.current?.focus(), 50) }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-400 dark:text-gray-500 hover:bg-white dark:hover:bg-white/5 hover:text-gray-700 dark:hover:text-gray-300 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Adicionar card
          </button>
        )}
      </div>
    </div>
  )
}
