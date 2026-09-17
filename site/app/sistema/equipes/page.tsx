'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import {
  getEquipes, getTodosUsuarios, criarEquipe, atualizarEquipe,
  excluirEquipe, adicionarMembro, atualizarMembro, removerMembro,
  type Equipe, type MembroEquipe,
} from './actions'

// ── Role badge ──────────────────────────────────────────────────────
const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  admin:       { label: 'Admin',        color: 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400' },
  rh:          { label: 'RH',           color: 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400' },
  gestor:      { label: 'Gestor',       color: 'bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400' },
  colaborador: { label: 'Colaborador',  color: 'bg-gray-100 dark:bg-white/8 text-gray-600 dark:text-gray-400' },
  atendente:   { label: 'Atendente',    color: 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400' },
}

function RoleBadge({ role }: { role: string }) {
  const cfg = ROLE_LABELS[role] ?? { label: role, color: 'bg-gray-100 text-gray-600' }
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${cfg.color}`}>
      {cfg.label}
    </span>
  )
}

// ── Avatar ──────────────────────────────────────────────────────────
function Avatar({ nome, fotoUrl, size = 32 }: { nome: string; fotoUrl?: string | null; size?: number }) {
  if (fotoUrl) return <Image src={fotoUrl} alt={nome} width={size} height={size} className="rounded-full object-cover" style={{ width: size, height: size }} />
  const initials = nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
  return (
    <div className="rounded-full bg-gold/20 text-gold flex items-center justify-center font-bold text-xs" style={{ width: size, height: size, fontSize: size * 0.35 }}>
      {initials}
    </div>
  )
}

// ── Organograma ─────────────────────────────────────────────────────
function OrgNode({
  membro, todos, equipeId, onUpdate, onRemove, depth = 0,
}: {
  membro: MembroEquipe
  todos: MembroEquipe[]
  equipeId: string
  onUpdate: () => void
  onRemove: (id: string) => void
  depth?: number
}) {
  const filhos = todos.filter(m => m.parent_id === membro.id)
  const [editCargo, setEditCargo] = useState(false)
  const [cargo, setCargo] = useState(membro.cargo_equipe ?? '')
  const [saving, setSaving] = useState(false)

  async function saveCargo() {
    setSaving(true)
    await atualizarMembro(membro.id, membro.parent_id, cargo || null)
    setSaving(false)
    setEditCargo(false)
    onUpdate()
  }

  return (
    <div className="relative">
      {depth > 0 && (
        <div className="absolute -left-4 top-5 w-4 h-px border-t-2 border-dashed border-gray-200 dark:border-white/10" />
      )}
      <div className={`group flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-white/8 bg-white dark:bg-[#111] hover:border-gray-200 dark:hover:border-white/15 transition-colors ${depth > 0 ? 'ml-4' : ''}`}>
        <Avatar nome={membro.usuario.nome} fotoUrl={membro.usuario.foto_url} size={36} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{membro.usuario.nome}</p>
          {editCargo ? (
            <input
              autoFocus
              value={cargo}
              onChange={e => setCargo(e.target.value)}
              onBlur={saveCargo}
              onKeyDown={e => e.key === 'Enter' && saveCargo()}
              className="text-xs text-gray-500 dark:text-gray-400 bg-transparent border-b border-gold/50 outline-none w-full"
              placeholder="cargo na equipe..."
            />
          ) : (
            <button onClick={() => setEditCargo(true)} className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-left truncate w-full">
              {membro.cargo_equipe || <span className="italic opacity-50">clique para definir cargo</span>}
            </button>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {membro.usuario.roles.map(r => <RoleBadge key={r} role={r} />)}
          <button
            onClick={() => onRemove(membro.id)}
            className="opacity-0 group-hover:opacity-100 ml-2 w-6 h-6 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {filhos.length > 0 && (
        <div className="ml-8 mt-1 space-y-1 border-l-2 border-dashed border-gray-100 dark:border-white/8 pl-4">
          {filhos.map(f => (
            <OrgNode key={f.id} membro={f} todos={todos} equipeId={equipeId} onUpdate={onUpdate} onRemove={onRemove} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Modal de equipe ─────────────────────────────────────────────────
type Usuario = { id: string; nome: string; email: string | null; cargo: string | null; foto_url: string | null; roles: string[] }

function EquipeModal({
  equipe, todosUsuarios, onClose, onSaved,
}: {
  equipe: Equipe | null
  todosUsuarios: Usuario[]
  onClose: () => void
  onSaved: () => void
}) {
  const isNova = !equipe
  const [nome, setNome] = useState(equipe?.nome ?? '')
  const [descricao, setDescricao] = useState(equipe?.descricao ?? '')
  const [membros, setMembros] = useState<MembroEquipe[]>(equipe?.membros ?? [])
  const [equipeId, setEquipeId] = useState(equipe?.id ?? '')
  const [saving, setSaving] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [parentSel, setParentSel] = useState('')

  const jaMembroIds = new Set(membros.map(m => m.usuario_id))
  const disponiveis = todosUsuarios.filter(u =>
    !jaMembroIds.has(u.id) &&
    (u.nome.toLowerCase().includes(search.toLowerCase()) || (u.email ?? '').toLowerCase().includes(search.toLowerCase()))
  )

  async function handleSalvarNome() {
    if (!nome.trim()) return
    setSaving(true)
    try {
      if (isNova) {
        const id = await criarEquipe(nome.trim(), descricao)
        setEquipeId(id)
      } else {
        await atualizarEquipe(equipe!.id, nome.trim(), descricao)
      }
      onSaved()
    } finally {
      setSaving(false)
    }
  }

  async function handleAddMembro(usuario: Usuario) {
    const eid = equipeId || equipe?.id
    if (!eid) return
    await adicionarMembro(eid, usuario.id, parentSel || undefined)
    const novo: MembroEquipe = {
      id: crypto.randomUUID(),
      usuario_id: usuario.id,
      parent_id: parentSel || null,
      cargo_equipe: null,
      usuario,
    }
    setMembros(prev => [...prev, novo])
    setAddOpen(false)
    setSearch('')
    setParentSel('')
    onSaved()
  }

  async function handleRemover(membroId: string) {
    await removerMembro(membroId)
    setMembros(prev => prev.filter(m => m.id !== membroId))
    onSaved()
  }

  const raizes = membros.filter(m => !m.parent_id)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/8 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/8">
          <h2 className="font-bold text-gray-900 dark:text-white">{isNova ? 'Nova Equipe' : 'Editar Equipe'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 dark:hover:text-white text-xl">×</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Nome + Descrição */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5">Nome da equipe</label>
              <input
                value={nome}
                onChange={e => setNome(e.target.value)}
                className="w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/8 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-gold/50"
                placeholder="Ex.: Equipe Redação"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5">Descrição <span className="normal-case font-normal">(opcional)</span></label>
              <textarea
                rows={2}
                value={descricao}
                onChange={e => setDescricao(e.target.value)}
                className="w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/8 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-gold/50 resize-none"
                placeholder="Descrição ou objetivo da equipe..."
              />
            </div>
            <button
              onClick={handleSalvarNome}
              disabled={saving || !nome.trim()}
              className="bg-gold text-white text-sm font-semibold px-5 py-2 rounded-xl hover:bg-gold/90 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Salvando...' : isNova ? 'Criar equipe' : 'Salvar'}
            </button>
          </div>

          {/* Membros */}
          {(equipeId || equipe?.id) && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Organograma — {membros.length} {membros.length === 1 ? 'membro' : 'membros'}
                </h3>
                <button
                  onClick={() => setAddOpen(v => !v)}
                  className="flex items-center gap-1.5 text-xs font-medium text-gold hover:text-gold/80 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Adicionar membro
                </button>
              </div>

              {/* Painel de adicionar */}
              {addOpen && (
                <div className="mb-4 p-4 bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/8 rounded-xl space-y-3">
                  <input
                    autoFocus
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Buscar colaborador..."
                    className="w-full bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/8 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-gold/50"
                  />
                  {membros.length > 0 && (
                    <div>
                      <label className="text-xs text-gray-400 dark:text-gray-500 mb-1 block">Reporta a (opcional)</label>
                      <select
                        value={parentSel}
                        onChange={e => setParentSel(e.target.value)}
                        className="w-full bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/8 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white outline-none"
                      >
                        <option value="">— Ninguém (topo da hierarquia)</option>
                        {membros.map(m => (
                          <option key={m.id} value={m.id}>{m.usuario.nome}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {disponiveis.length === 0 ? (
                      <p className="text-xs text-gray-400 dark:text-gray-600 text-center py-2">Nenhum colaborador encontrado</p>
                    ) : disponiveis.map(u => (
                      <button
                        key={u.id}
                        onClick={() => handleAddMembro(u)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white dark:hover:bg-white/5 transition-colors text-left"
                      >
                        <Avatar nome={u.nome} fotoUrl={u.foto_url} size={28} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 dark:text-white truncate">{u.nome}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{u.email}</p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          {u.roles.map(r => <RoleBadge key={r} role={r} />)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Árvore */}
              {membros.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-gray-600 text-center py-6">Nenhum membro ainda. Adicione colaboradores acima.</p>
              ) : (
                <div className="space-y-1">
                  {raizes.map(m => (
                    <OrgNode key={m.id} membro={m} todos={membros} equipeId={equipeId || equipe!.id} onUpdate={onSaved} onRemove={handleRemover} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Página principal ────────────────────────────────────────────────
export default function EquipesPage() {
  const [equipes, setEquipes] = useState<Equipe[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<'new' | Equipe | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    const [e, u] = await Promise.all([getEquipes(), getTodosUsuarios()])
    setEquipes(e)
    setUsuarios(u as Usuario[])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function handleExcluir(id: string) {
    if (!confirm('Excluir esta equipe? Os membros não serão excluídos, apenas removidos da equipe.')) return
    setDeletingId(id)
    await excluirEquipe(id)
    setDeletingId(null)
    load()
  }

  return (
    <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">

        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-600 mb-1">
              <a href="/sistema" className="hover:text-gray-700 dark:hover:text-gray-400 transition-colors">Painel</a>
              <span>›</span>
              <span>Equipes</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Equipes</h1>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Organize colaboradores em equipes e defina a hierarquia.</p>
          </div>
          <button
            onClick={() => setModal('new')}
            className="flex items-center gap-2 bg-gold text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-gold/90 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nova equipe
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {equipes.map(equipe => (
              <div key={equipe.id} className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl shadow-sm dark:shadow-none overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50 dark:border-white/[0.04]">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${equipe.is_empresa ? 'bg-navy/10 dark:bg-white/10' : 'bg-gold/10'}`}>
                      {equipe.is_empresa ? (
                        <svg className="w-4 h-4 text-navy dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-semibold text-gray-900 dark:text-white">{equipe.nome}</h2>
                        {equipe.is_empresa && (
                          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-navy/10 dark:bg-white/10 text-navy dark:text-gray-300">Empresa</span>
                        )}
                      </div>
                      {equipe.descricao && <p className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">{equipe.descricao}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 dark:text-gray-600">{equipe.membros.length} {equipe.membros.length === 1 ? 'membro' : 'membros'}</span>
                    <button
                      onClick={() => setModal(equipe)}
                      className="text-xs font-medium text-gray-500 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white border border-gray-200 dark:border-white/8 rounded-lg px-3 py-1.5 hover:border-gray-300 dark:hover:border-white/15 transition-colors"
                    >
                      Gerenciar →
                    </button>
                    {!equipe.is_empresa && (
                      <button
                        onClick={() => handleExcluir(equipe.id)}
                        disabled={deletingId === equipe.id}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-40"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* Preview de membros */}
                {equipe.membros.length > 0 && (
                  <div className="px-6 py-3 flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {equipe.membros.slice(0, 6).map(m => (
                        <div key={m.id} className="ring-2 ring-white dark:ring-[#111] rounded-full" title={m.usuario.nome}>
                          <Avatar nome={m.usuario.nome} fotoUrl={m.usuario.foto_url} size={28} />
                        </div>
                      ))}
                      {equipe.membros.length > 6 && (
                        <div className="w-7 h-7 ring-2 ring-white dark:ring-[#111] rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-[10px] font-bold text-gray-500 dark:text-gray-400">
                          +{equipe.membros.length - 6}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-600 ml-1">
                      {equipe.membros.slice(0, 3).map(m => m.usuario.nome.split(' ')[0]).join(', ')}
                      {equipe.membros.length > 3 ? ` e mais ${equipe.membros.length - 3}` : ''}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      {modal && (
        <EquipeModal
          equipe={modal === 'new' ? null : modal}
          todosUsuarios={usuarios}
          onClose={() => setModal(null)}
          onSaved={() => { load() }}
        />
      )}
    </div>
  )
}
