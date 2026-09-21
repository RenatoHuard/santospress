'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getKanbanData, renomearQuadro, type KanbanData } from '../../actions/kanban'
import { KanbanBoard } from '../../components/kanban/KanbanBoard'

export default function KanbanBoardPage() {
  const { quadroId } = useParams<{ quadroId: string }>()
  const router = useRouter()
  const [data, setData] = useState<KanbanData | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingNome, setEditingNome] = useState(false)
  const [nomeInput, setNomeInput] = useState('')

  useEffect(() => {
    getKanbanData(quadroId).then(d => {
      if (!d) { router.replace('/sistema/kanban'); return }
      setData(d)
      setNomeInput(d.quadro.nome)
      setLoading(false)
    })
  }, [quadroId, router])

  async function handleRenameBlur() {
    setEditingNome(false)
    if (!data || !nomeInput.trim() || nomeInput === data.quadro.nome) return
    await renomearQuadro(quadroId, nomeInput.trim())
    setData(prev => prev ? { ...prev, quadro: { ...prev.quadro, nome: nomeInput.trim() } } : prev)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-7 h-7 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Board header */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-100 dark:border-white/5 bg-white dark:bg-[#111] shrink-0">
        <Link
          href="/sistema/kanban"
          className="text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>

        {editingNome ? (
          <input
            autoFocus
            className="text-lg font-bold bg-transparent border-b-2 border-gold text-gray-900 dark:text-white outline-none pb-0.5 min-w-[200px]"
            value={nomeInput}
            onChange={e => setNomeInput(e.target.value)}
            onBlur={handleRenameBlur}
            onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); if (e.key === 'Escape') { setNomeInput(data.quadro.nome); setEditingNome(false) } }}
          />
        ) : (
          <button
            className="text-lg font-bold text-gray-900 dark:text-white hover:text-gold transition-colors"
            onDoubleClick={() => setEditingNome(true)}
            title="Duplo clique para renomear"
          >
            {data.quadro.nome}
          </button>
        )}

        {data.quadro.cliente_id && (
          <span className="text-xs text-gold font-medium px-2.5 py-1 bg-gold/10 rounded-full">
            {data.clientes.find(c => c.id === data.quadro.cliente_id)?.nome ?? 'Cliente'}
          </span>
        )}

        <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">
          {data.colunas.reduce((acc, c) => acc + c.cards.length, 0)} cards · {data.colunas.length} colunas
        </span>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-hidden bg-gray-50 dark:bg-[#0a0a0a] pt-4">
        <KanbanBoard initialData={data} />
      </div>
    </div>
  )
}
