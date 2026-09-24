'use client'

import { useEffect, useRef, useState } from 'react'
import {
  getMembrosQuadro,
  adicionarMembroQuadro,
  removerMembroQuadro,
  type UsuarioSimples,
} from '../../actions/kanban'

interface Props {
  quadroId: string
  todosUsuarios: UsuarioSimples[]
  isAdminGestor: boolean
}

function Avatar({ u, size = 28 }: { u: UsuarioSimples; size?: number }) {
  if (u.foto_url) {
    return (
      <img
        src={u.foto_url}
        alt={u.nome}
        title={u.nome}
        style={{ width: size, height: size }}
        className="rounded-full object-cover border-2 border-white dark:border-[#111] -ml-1.5 first:ml-0"
      />
    )
  }
  const initials = u.nome.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase()
  return (
    <div
      title={u.nome}
      style={{ width: size, height: size, fontSize: size * 0.35 }}
      className="rounded-full bg-navy/20 dark:bg-navy/40 flex items-center justify-center font-bold text-navy dark:text-blue-300 border-2 border-white dark:border-[#111] -ml-1.5 first:ml-0 shrink-0"
    >
      {initials}
    </div>
  )
}

export function QuadroMembros({ quadroId, todosUsuarios, isAdminGestor }: Props) {
  const [membros, setMembros]       = useState<UsuarioSimples[]>([])
  const [open, setOpen]             = useState(false)
  const [loading, setLoading]       = useState(false)
  const [addingId, setAddingId]     = useState('')
  const [removingId, setRemovingId] = useState<string | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getMembrosQuadro(quadroId).then(setMembros)
  }, [quadroId])

  useEffect(() => {
    if (!open) return
    function onClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  const membroIds = new Set(membros.map(m => m.id))
  const disponiveis = todosUsuarios.filter(u => !membroIds.has(u.id))

  async function handleAdd() {
    if (!addingId) return
    const u = todosUsuarios.find(u => u.id === addingId)
    if (!u) return
    setLoading(true)
    await adicionarMembroQuadro(quadroId, addingId)
    setMembros(prev => [...prev, u])
    setAddingId('')
    setLoading(false)
  }

  async function handleRemove(usuarioId: string) {
    setRemovingId(usuarioId)
    await removerMembroQuadro(quadroId, usuarioId)
    setMembros(prev => prev.filter(m => m.id !== usuarioId))
    setRemovingId(null)
  }

  if (!isAdminGestor && membros.length === 0) return null

  return (
    <div className="relative flex items-center" ref={panelRef}>
      {/* Avatar stack */}
      <button
        onClick={() => isAdminGestor && setOpen(o => !o)}
        className={`flex items-center ${isAdminGestor ? 'cursor-pointer hover:opacity-80' : 'cursor-default'} transition-opacity`}
        title={isAdminGestor ? 'Gerenciar membros' : 'Membros do quadro'}
      >
        <div className="flex items-center pl-1.5">
          {membros.slice(0, 5).map(m => <Avatar key={m.id} u={m} />)}
          {membros.length > 5 && (
            <div
              style={{ width: 28, height: 28, fontSize: 10 }}
              className="rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center font-bold text-gray-500 dark:text-gray-400 border-2 border-white dark:border-[#111] -ml-1.5"
            >
              +{membros.length - 5}
            </div>
          )}
          {membros.length === 0 && isAdminGestor && (
            <div
              style={{ width: 28, height: 28 }}
              className="rounded-full border-2 border-dashed border-gray-300 dark:border-white/20 flex items-center justify-center text-gray-400 dark:text-gray-500"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
          )}
        </div>
        {isAdminGestor && (
          <span className="ml-2 text-[11px] text-gray-400 dark:text-gray-500 font-medium">
            {membros.length === 0 ? 'Adicionar membros' : `${membros.length} membro${membros.length !== 1 ? 's' : ''}`}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && isAdminGestor && (
        <div className="absolute top-full mt-2 left-0 z-50 w-72 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-white/5">
            <p className="text-xs font-semibold text-gray-700 dark:text-white uppercase tracking-wider">Membros do Quadro</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Podem visualizar este quadro</p>
          </div>

          {/* Lista de membros atuais */}
          <div className="max-h-48 overflow-y-auto">
            {membros.length === 0 ? (
              <p className="text-xs text-gray-400 dark:text-gray-500 px-4 py-3 text-center">Nenhum membro adicionado</p>
            ) : (
              membros.map(m => (
                <div key={m.id} className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-white/5 group">
                  <Avatar u={m} size={32} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 dark:text-white truncate">{m.nome}</p>
                    {m.cargo && <p className="text-[10px] text-gray-400 truncate">{m.cargo}</p>}
                  </div>
                  <button
                    onClick={() => handleRemove(m.id)}
                    disabled={removingId === m.id}
                    className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all disabled:opacity-40"
                    title="Remover"
                  >
                    {removingId === m.id ? (
                      <div className="w-4 h-4 border border-gray-300 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Adicionar membro */}
          {disponiveis.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-100 dark:border-white/5 flex items-center gap-2">
              <select
                value={addingId}
                onChange={e => setAddingId(e.target.value)}
                className="flex-1 text-xs bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-gray-700 dark:text-gray-300 outline-none focus:border-gold/50"
              >
                <option value="">Selecionar colaborador...</option>
                {disponiveis.map(u => (
                  <option key={u.id} value={u.id}>{u.nome}{u.cargo ? ` — ${u.cargo}` : ''}</option>
                ))}
              </select>
              <button
                onClick={handleAdd}
                disabled={!addingId || loading}
                className="text-xs bg-gold text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-gold/90 disabled:opacity-40 transition-colors shrink-0"
              >
                {loading ? '...' : 'Adicionar'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
