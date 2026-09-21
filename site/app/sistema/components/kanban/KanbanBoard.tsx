'use client'

import { useState, useCallback } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, arrayMove, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import { KanbanColumn } from './KanbanColumn'
import { KanbanCard } from './KanbanCard'
import { CardDetalhes } from './CardDetalhes'
import {
  criarColuna,
  reordenarColunas,
  reordenarCards,
  type KanbanData,
  type KanbanColuna,
  type KanbanCard as KanbanCardType,
} from '../../actions/kanban'

interface Props {
  initialData: KanbanData
}

export function KanbanBoard({ initialData }: Props) {
  const [colunas, setColunas] = useState<KanbanColuna[]>(initialData.colunas)
  const [activeCard, setActiveCard] = useState<KanbanCardType | null>(null)
  const [activeColunaId, setActiveColunaId] = useState<string | null>(null)
  const [selectedCard, setSelectedCard] = useState<KanbanCardType | null>(null)
  const [addingColuna, setAddingColuna] = useState(false)
  const [novaColunaNome, setNovaColunaNome] = useState('')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  )

  const columnIds = colunas.map(c => c.id)

  function findColunaByCardId(cardId: string) {
    return colunas.find(col => col.cards.some(c => c.id === cardId))
  }

  function onDragStart({ active }: DragStartEvent) {
    const type = active.data.current?.type
    if (type === 'card') {
      setActiveCard(active.data.current?.card ?? null)
    } else if (type === 'coluna') {
      setActiveColunaId(active.id as string)
    }
  }

  function onDragOver({ active, over }: DragOverEvent) {
    if (!over) return
    const activeId = active.id as string
    const overId = over.id as string
    if (activeId === overId) return

    const isActiveCard = active.data.current?.type === 'card'
    if (!isActiveCard) return

    const isOverCard = over.data.current?.type === 'card'
    const isOverColuna = over.data.current?.type === 'coluna'

    setColunas(prev => {
      const activeColIdx = prev.findIndex(col => col.cards.some(c => c.id === activeId))
      if (activeColIdx === -1) return prev

      if (isOverCard) {
        const overColIdx = prev.findIndex(col => col.cards.some(c => c.id === overId))
        if (overColIdx === -1) return prev

        const newColunas = prev.map(c => ({ ...c, cards: [...c.cards] }))

        if (activeColIdx === overColIdx) {
          const activeIdx = newColunas[activeColIdx].cards.findIndex(c => c.id === activeId)
          const overIdx = newColunas[activeColIdx].cards.findIndex(c => c.id === overId)
          newColunas[activeColIdx].cards = arrayMove(newColunas[activeColIdx].cards, activeIdx, overIdx)
        } else {
          const activeIdx = newColunas[activeColIdx].cards.findIndex(c => c.id === activeId)
          const overIdx = newColunas[overColIdx].cards.findIndex(c => c.id === overId)
          const [moved] = newColunas[activeColIdx].cards.splice(activeIdx, 1)
          newColunas[overColIdx].cards.splice(overIdx, 0, moved)
        }
        return newColunas
      }

      if (isOverColuna) {
        const overColunaId = over.data.current?.colunaId as string
        const overColIdx = prev.findIndex(col => col.id === overColunaId)
        if (overColIdx === -1 || activeColIdx === overColIdx) return prev

        const newColunas = prev.map(c => ({ ...c, cards: [...c.cards] }))
        const activeIdx = newColunas[activeColIdx].cards.findIndex(c => c.id === activeId)
        const [moved] = newColunas[activeColIdx].cards.splice(activeIdx, 1)
        newColunas[overColIdx].cards.push(moved)
        return newColunas
      }

      return prev
    })
  }

  function onDragEnd({ active, over }: DragEndEvent) {
    const activeId = active.id as string
    const type = active.data.current?.type

    setActiveCard(null)
    setActiveColunaId(null)

    if (!over) return

    if (type === 'coluna') {
      const overId = over.id as string
      if (activeId === overId) return
      setColunas(prev => {
        const ai = prev.findIndex(c => c.id === activeId)
        const oi = prev.findIndex(c => c.id === overId)
        const next = arrayMove(prev, ai, oi).map((c, i) => ({ ...c, ordem: i }))
        reordenarColunas(next.map(c => ({ id: c.id, ordem: c.ordem })))
        return next
      })
      return
    }

    if (type === 'card') {
      setColunas(prev => {
        const col = prev.find(c => c.cards.some(card => card.id === activeId))
        if (!col) return prev
        const reordens = col.cards.map((c, i) => ({ id: c.id, ordem: i, coluna_id: col.id }))
        reordenarCards(reordens)
        return prev
      })
    }
  }

  const handleCardUpdate = useCallback((cardId: string, dados: Partial<KanbanCardType>) => {
    setColunas(prev =>
      prev.map(col => ({
        ...col,
        cards: col.cards.map(c => c.id === cardId ? { ...c, ...dados } : c),
      }))
    )
    if (selectedCard?.id === cardId) {
      setSelectedCard(prev => prev ? { ...prev, ...dados } : prev)
    }
  }, [selectedCard])

  const handleCardDelete = useCallback((cardId: string) => {
    setColunas(prev =>
      prev.map(col => ({ ...col, cards: col.cards.filter(c => c.id !== cardId) }))
    )
  }, [])

  async function handleAddColuna() {
    const nome = novaColunaNome.trim()
    if (!nome) { setAddingColuna(false); return }
    const result = await criarColuna(initialData.quadro.id, nome)
    if (result) {
      setColunas(prev => [...prev, { id: result.id, nome, ordem: result.ordem, cards: [] }])
    }
    setNovaColunaNome('')
    setAddingColuna(false)
  }

  const activeColuna = activeColunaId ? colunas.find(c => c.id === activeColunaId) : null

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        <div className="flex gap-4 pb-6 overflow-x-auto px-6 items-start min-h-[calc(100vh-140px)]">
          <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
            {colunas.map(col => (
              <KanbanColumn
                key={col.id}
                coluna={col}
                quadroId={initialData.quadro.id}
                usuarios={initialData.usuarios}
                clientes={initialData.clientes}
                onCardClick={setSelectedCard}
                onAddCard={(colunaId, card) => {
                  setColunas(prev => prev.map(c => c.id === colunaId ? { ...c, cards: [...c.cards, card] } : c))
                }}
                onDeleteColuna={colunaId => setColunas(prev => prev.filter(c => c.id !== colunaId))}
                onRenameColuna={(colunaId, nome) => setColunas(prev => prev.map(c => c.id === colunaId ? { ...c, nome } : c))}
              />
            ))}
          </SortableContext>

          {/* Add column */}
          <div className="shrink-0 w-72">
            {addingColuna ? (
              <div className="bg-gray-100 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/5 rounded-2xl p-3 space-y-2">
                <input
                  autoFocus
                  className="w-full bg-white dark:bg-[#111] border border-gray-200 dark:border-white/8 rounded-xl px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white outline-none focus:border-gold/50"
                  placeholder="Nome da coluna..."
                  value={novaColunaNome}
                  onChange={e => setNovaColunaNome(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAddColuna(); if (e.key === 'Escape') { setAddingColuna(false); setNovaColunaNome('') } }}
                />
                <div className="flex items-center gap-2">
                  <button onClick={handleAddColuna} className="text-xs bg-gold text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-gold/90 transition-colors">
                    Adicionar
                  </button>
                  <button onClick={() => { setAddingColuna(false); setNovaColunaNome('') }} className="text-xs text-gray-400 hover:text-gray-600">
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAddingColuna(true)}
                className="w-full flex items-center gap-2 px-4 py-3 rounded-2xl bg-gray-100/80 dark:bg-[#1a1a1a]/80 border border-dashed border-gray-300 dark:border-white/10 text-sm text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-400 dark:hover:border-white/20 hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Adicionar coluna
              </button>
            )}
          </div>
        </div>

        <DragOverlay>
          {activeCard && (
            <KanbanCard card={activeCard} onClick={() => {}} overlay />
          )}
          {activeColuna && (
            <div className="w-72 rounded-2xl bg-gray-100 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/5 opacity-90 p-3">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 px-1">{activeColuna.nome}</p>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {selectedCard && (
        <CardDetalhes
          card={selectedCard}
          usuarios={initialData.usuarios}
          clientes={initialData.clientes}
          onClose={() => setSelectedCard(null)}
          onUpdate={handleCardUpdate}
          onDelete={handleCardDelete}
        />
      )}
    </>
  )
}
