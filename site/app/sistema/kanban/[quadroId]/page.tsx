'use client'

import { useEffect, useState, useTransition } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import {
  getKanbanData,
  getUsuarioByAuthId,
  renomearQuadro,
  atualizarVisibilidadeQuadro,
  type KanbanData,
  type UsuarioSimples,
} from '../../actions/kanban'
import { KanbanBoard } from '../../components/kanban/KanbanBoard'
import { QuadroMembros } from '../../components/kanban/QuadroMembros'

function IconGlobo() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  )
}

function IconCadeado() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  )
}

export default function KanbanBoardPage() {
  const { quadroId } = useParams<{ quadroId: string }>()
  const router = useRouter()
  const [data, setData]               = useState<KanbanData | null>(null)
  const [loading, setLoading]         = useState(true)
  const [editingNome, setEditingNome] = useState(false)
  const [nomeInput, setNomeInput]     = useState('')
  const [currentUser, setCurrentUser] = useState<UsuarioSimples | null>(null)
  const [isPending, startTransition]  = useTransition()

  useEffect(() => {
    getKanbanData(quadroId).then(d => {
      if (!d) { router.replace('/sistema/kanban'); return }
      setData(d)
      setNomeInput(d.quadro.nome)
      setLoading(false)
    })
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) setCurrentUser(await getUsuarioByAuthId(user.id))
    })
  }, [quadroId, router])

  const isAdminGestor = !!(currentUser?.roles?.includes('admin') || currentUser?.roles?.includes('gestor') || currentUser?.roles?.includes('rh'))
  const isCreator     = !!(currentUser?.id && data?.quadro.criador_id === currentUser.id)
  const canManage     = isAdminGestor || isCreator

  async function handleRenameBlur() {
    setEditingNome(false)
    if (!data || !nomeInput.trim() || nomeInput === data.quadro.nome) return
    await renomearQuadro(quadroId, nomeInput.trim())
    setData(prev => prev ? { ...prev, quadro: { ...prev.quadro, nome: nomeInput.trim() } } : prev)
  }

  function toggleVisibilidade() {
    if (!data || !canManage) return
    const nova = data.quadro.visibilidade === 'publico' ? 'privado' : 'publico'
    startTransition(async () => {
      await atualizarVisibilidadeQuadro(quadroId, nova)
      setData(prev => prev ? { ...prev, quadro: { ...prev.quadro, visibilidade: nova } } : prev)
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-7 h-7 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!data) return null

  const visibilidade = data.quadro.visibilidade ?? 'publico'

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

        {editingNome && canManage ? (
          <input
            autoFocus
            className="text-lg font-bold bg-transparent border-b-2 border-gold text-gray-900 dark:text-white outline-none pb-0.5 min-w-[200px]"
            value={nomeInput}
            onChange={e => setNomeInput(e.target.value)}
            onBlur={handleRenameBlur}
            onKeyDown={e => {
              if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
              if (e.key === 'Escape') { setNomeInput(data.quadro.nome); setEditingNome(false) }
            }}
          />
        ) : (
          <button
            className={`text-lg font-bold text-gray-900 dark:text-white transition-colors ${canManage ? 'hover:text-gold' : 'cursor-default'}`}
            onDoubleClick={() => canManage && setEditingNome(true)}
            title={canManage ? 'Duplo clique para renomear' : undefined}
          >
            {data.quadro.nome}
          </button>
        )}

        {/* Badge/toggle de visibilidade */}
        {canManage ? (
          <button
            onClick={toggleVisibilidade}
            disabled={isPending}
            title={visibilidade === 'privado' ? 'Quadro privado — clique para tornar público' : 'Quadro público — clique para tornar privado'}
            className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-colors disabled:opacity-50 ${visibilidade === 'privado' ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/30 hover:bg-amber-100' : 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-white/5 dark:text-gray-400 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10'}`}
          >
            {visibilidade === 'privado' ? <IconCadeado /> : <IconGlobo />}
            {visibilidade === 'privado' ? 'Privado' : 'Público'}
          </button>
        ) : (
          <span className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${visibilidade === 'privado' ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/30' : 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-white/5 dark:text-gray-400 dark:border-white/10'}`}>
            {visibilidade === 'privado' ? <IconCadeado /> : <IconGlobo />}
            {visibilidade === 'privado' ? 'Privado' : 'Público'}
          </span>
        )}

        {data.quadro.cliente_id && (
          <span className="text-xs text-gold font-medium px-2.5 py-1 bg-gold/10 rounded-full">
            {data.clientes.find(c => c.id === data.quadro.cliente_id)?.nome ?? 'Cliente'}
          </span>
        )}

        <span className="text-xs text-gray-400 dark:text-gray-500">
          {data.colunas.reduce((acc, c) => acc + c.cards.length, 0)} cards · {data.colunas.length} colunas
        </span>

        <div className="ml-4">
          <QuadroMembros
            quadroId={quadroId}
            todosUsuarios={data.usuarios}
            canManage={canManage}
          />
        </div>

        <Link
          href="/sistema/calendario"
          className="ml-auto flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gold dark:hover:text-gold transition-colors px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/8 hover:border-gold/40"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
          </svg>
          Calendário
        </Link>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-hidden bg-gray-50 dark:bg-[#0a0a0a] pt-4">
        <KanbanBoard initialData={data} />
      </div>
    </div>
  )
}
