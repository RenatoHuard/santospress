'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getQuadros, criarQuadro, deletarQuadro, type Quadro } from '../actions/kanban'

export default function KanbanListPage() {
  const router = useRouter()
  const [quadros, setQuadros] = useState<Quadro[]>([])
  const [loading, setLoading] = useState(true)
  const [criando, setCriando] = useState(false)
  const [nomeNovo, setNomeNovo] = useState('')
  const [isPending, startTransition] = useTransition()
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  useEffect(() => {
    getQuadros().then(data => { setQuadros(data); setLoading(false) })
  }, [])

  function handleCriar() {
    const nome = nomeNovo.trim()
    if (!nome) { setCriando(false); return }
    startTransition(async () => {
      const result = await criarQuadro(nome)
      if (result) router.push(`/sistema/kanban/${result.id}`)
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deletarQuadro(id)
      setQuadros(prev => prev.filter(q => q.id !== id))
      setConfirmDelete(null)
    })
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quadros Kanban</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Gerencie tarefas e demandas por quadro.</p>
        </div>
        <button
          onClick={() => setCriando(true)}
          className="flex items-center gap-2 bg-gold hover:bg-gold/90 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Novo quadro
        </button>
      </div>

      {/* Novo quadro inline */}
      {criando && (
        <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl p-5 mb-6 flex items-center gap-3">
          <input
            autoFocus
            className="flex-1 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/8 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-gold/50 focus:ring-2 focus:ring-gold/15"
            placeholder="Nome do quadro..."
            value={nomeNovo}
            onChange={e => setNomeNovo(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleCriar(); if (e.key === 'Escape') { setCriando(false); setNomeNovo('') } }}
          />
          <button onClick={handleCriar} disabled={isPending} className="bg-gold text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-gold/90 disabled:opacity-60 transition-colors">
            {isPending ? 'Criando...' : 'Criar'}
          </button>
          <button onClick={() => { setCriando(false); setNomeNovo('') }} className="text-sm text-gray-400 hover:text-gray-700 dark:hover:text-white px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 transition-colors">
            Cancelar
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <div className="w-7 h-7 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      ) : quadros.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6z" />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Nenhum quadro ainda</p>
          <p className="text-sm text-gray-400 dark:text-gray-600 mt-1">Crie seu primeiro quadro para começar.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quadros.map(q => (
            <div key={q.id} className="group relative bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden hover:border-gold/30 hover:shadow-md transition-all">
              <Link href={`/sistema/kanban/${q.id}`} className="block p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-navy/10 dark:bg-navy/30 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-navy dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                    </svg>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                    {q.total_cards} {q.total_cards === 1 ? 'card' : 'cards'}
                  </span>
                </div>
                <p className="text-base font-bold text-gray-900 dark:text-white">{q.nome}</p>
                {q.cliente_nome && (
                  <p className="text-xs text-gold mt-0.5">{q.cliente_nome}</p>
                )}
                <p className="text-xs text-gray-400 dark:text-gray-600 mt-2">
                  {new Date(q.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
              </Link>

              {/* Delete */}
              {confirmDelete === q.id ? (
                <div className="absolute top-3 right-3 flex items-center gap-1">
                  <button onClick={() => setConfirmDelete(null)} className="text-[10px] text-gray-400 px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/5 hover:bg-gray-200">✕</button>
                  <button onClick={() => handleDelete(q.id)} className="text-[10px] text-white bg-red-500 hover:bg-red-600 px-1.5 py-0.5 rounded font-semibold">✓</button>
                </div>
              ) : (
                <button
                  onClick={e => { e.preventDefault(); setConfirmDelete(q.id) }}
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-gray-300 dark:text-gray-600 hover:text-red-400 transition-all p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
