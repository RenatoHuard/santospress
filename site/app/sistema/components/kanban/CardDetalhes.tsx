'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import {
  atualizarCard, deletarCard,
  toggleEtiquetaCard, criarEtiqueta, atualizarEtiqueta, deletarEtiqueta,
  getComentarios, addComentario, deleteComentario,
  type KanbanCard, type UsuarioSimples, type ClienteSimples, type Etiqueta, type Comentario,
} from '../../actions/kanban'

const INPUT = 'w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/8 text-gray-900 dark:text-white rounded-xl px-3 py-2.5 text-sm outline-none focus:border-gold/50 focus:ring-2 focus:ring-gold/15 transition'
const SELECT = INPUT + ' cursor-pointer'
const LABEL = 'block text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5'
const PRIORIDADES = ['baixa', 'media', 'alta', 'urgente']
const PRIORIDADE_LABEL: Record<string, string> = { baixa: 'Baixa', media: 'Média', alta: 'Alta', urgente: 'Urgente' }

const PALETTE = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4',
  '#3b82f6', '#8b5cf6', '#ec4899', '#64748b', '#d4a017',
]

interface Props {
  card: KanbanCard | null
  quadroId: string
  etiquetasBoard: Etiqueta[]
  usuarios: UsuarioSimples[]
  clientes: ClienteSimples[]
  onClose: () => void
  onUpdate: (cardId: string, dados: Partial<KanbanCard>) => void
  onDelete: (cardId: string) => void
  onEtiquetaBoardChange: (etiquetas: Etiqueta[]) => void
}

export function CardDetalhes({
  card, quadroId, etiquetasBoard, usuarios, clientes,
  onClose, onUpdate, onDelete, onEtiquetaBoardChange,
}: Props) {
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [tipo, setTipo] = useState('')
  const [prioridade, setPrioridade] = useState('media')
  const [clienteId, setClienteId] = useState<string>('')
  const [responsavelId, setResponsavelId] = useState<string>('')
  const [prazo, setPrazo] = useState('')
  const [concluida, setConcluida] = useState(false)
  const [cardEtiquetas, setCardEtiquetas] = useState<Etiqueta[]>([])

  const [isPending, startTransition] = useTransition()
  const [confirmDelete, setConfirmDelete] = useState(false)

  // etiqueta picker
  const [showEtiquetaMenu, setShowEtiquetaMenu] = useState(false)
  const [etiquetaEditId, setEtiquetaEditId] = useState<string | null>(null)
  const [etiquetaEditNome, setEtiquetaEditNome] = useState('')
  const [etiquetaEditCor, setEtiquetaEditCor] = useState(PALETTE[0])
  const [novaEtiquetaNome, setNovaEtiquetaNome] = useState('')
  const [novaEtiquetaCor, setNovaEtiquetaCor] = useState(PALETTE[0])
  const [criandoEtiqueta, setCriandoEtiqueta] = useState(false)
  const etiquetaMenuRef = useRef<HTMLDivElement>(null)

  // comentarios
  const [comentarios, setComentarios] = useState<Comentario[]>([])
  const [loadingComentarios, setLoadingComentarios] = useState(false)
  const [novoComentario, setNovoComentario] = useState('')
  const [submittingComentario, setSubmittingComentario] = useState(false)

  useEffect(() => {
    if (!card) return
    setTitulo(card.titulo)
    setDescricao(card.descricao ?? '')
    setTipo(card.tipo ?? '')
    setPrioridade(card.prioridade)
    setClienteId(card.cliente_id ?? '')
    setResponsavelId(card.responsavel_id ?? '')
    setPrazo(card.prazo ?? '')
    setConcluida(!!card.concluida_em)
    setCardEtiquetas(card.etiquetas ?? [])
    setConfirmDelete(false)
    setShowEtiquetaMenu(false)
    setCriandoEtiqueta(false)
    setNovoComentario('')
    setLoadingComentarios(true)
    getComentarios(card.id).then(data => {
      setComentarios(data)
      setLoadingComentarios(false)
    })
  }, [card?.id])

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (etiquetaMenuRef.current && !etiquetaMenuRef.current.contains(e.target as Node)) {
        setShowEtiquetaMenu(false)
        setEtiquetaEditId(null)
        setCriandoEtiqueta(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  if (!card) return null

  function salvar(patch: Record<string, unknown>) {
    if (!card) return
    startTransition(async () => {
      await atualizarCard(card.id, patch as Parameters<typeof atualizarCard>[1])
      onUpdate(card.id, patch as Partial<KanbanCard>)
    })
  }

  function handleConcluidaToggle() {
    const val = !concluida
    setConcluida(val)
    salvar({ concluida_em: val ? new Date().toISOString() : null })
  }

  function handleExcluir() {
    if (!card) return
    startTransition(async () => {
      await deletarCard(card.id)
      onDelete(card.id)
      onClose()
    })
  }

  // ── Etiquetas ──

  function isEtiquetaAtiva(etiquetaId: string) {
    return cardEtiquetas.some(e => e.id === etiquetaId)
  }

  async function handleToggleEtiqueta(etiqueta: Etiqueta) {
    if (!card) return
    const ativo = !isEtiquetaAtiva(etiqueta.id)
    await toggleEtiquetaCard(card.id, etiqueta.id, ativo)
    const next = ativo ? [...cardEtiquetas, etiqueta] : cardEtiquetas.filter(e => e.id !== etiqueta.id)
    setCardEtiquetas(next)
    onUpdate(card.id, { etiquetas: next })
  }

  async function handleCriarEtiqueta() {
    const e = await criarEtiqueta(quadroId, novaEtiquetaCor, novaEtiquetaNome || undefined)
    if (!e) return
    onEtiquetaBoardChange([...etiquetasBoard, e])
    setNovaEtiquetaNome('')
    setNovaEtiquetaCor(PALETTE[0])
    setCriandoEtiqueta(false)
  }

  function startEdit(e: Etiqueta) {
    setEtiquetaEditId(e.id)
    setEtiquetaEditNome(e.nome ?? '')
    setEtiquetaEditCor(e.cor)
  }

  async function handleSalvarEtiqueta() {
    if (!etiquetaEditId || !card) return
    await atualizarEtiqueta(etiquetaEditId, { nome: etiquetaEditNome || null, cor: etiquetaEditCor })
    const updated = etiquetasBoard.map(e => e.id === etiquetaEditId ? { ...e, nome: etiquetaEditNome || null, cor: etiquetaEditCor } : e)
    onEtiquetaBoardChange(updated)
    const updatedCard = cardEtiquetas.map(e => e.id === etiquetaEditId ? { ...e, nome: etiquetaEditNome || null, cor: etiquetaEditCor } : e)
    setCardEtiquetas(updatedCard)
    onUpdate(card.id, { etiquetas: updatedCard })
    setEtiquetaEditId(null)
  }

  async function handleDeletarEtiqueta(etiquetaId: string) {
    if (!card) return
    await deletarEtiqueta(etiquetaId)
    onEtiquetaBoardChange(etiquetasBoard.filter(e => e.id !== etiquetaId))
    const next = cardEtiquetas.filter(e => e.id !== etiquetaId)
    setCardEtiquetas(next)
    onUpdate(card.id, { etiquetas: next })
    setEtiquetaEditId(null)
  }

  // ── Comentários ──

  async function handleAddComentario() {
    if (!novoComentario.trim() || !card) return
    setSubmittingComentario(true)
    const novo = await addComentario(card.id, novoComentario.trim())
    if (novo) {
      setComentarios(prev => [...prev, novo])
      setNovoComentario('')
    }
    setSubmittingComentario(false)
  }

  async function handleDeleteComentario(id: string) {
    await deleteComentario(id)
    setComentarios(prev => prev.filter(c => c.id !== id))
  }

  function formatDate(iso: string) {
    const d = new Date(iso)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffM = Math.floor(diffMs / 60000)
    if (diffM < 1) return 'agora'
    if (diffM < 60) return `${diffM} min atrás`
    const diffH = Math.floor(diffM / 60)
    if (diffH < 24) return `${diffH}h atrás`
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' })
  }

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-40 bg-black/20 dark:bg-black/40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white dark:bg-[#111] shadow-2xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/5 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handleConcluidaToggle}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                concluida
                  ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                  : 'bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              {concluida ? 'Concluída' : 'Concluir'}
            </button>
            <span className="text-[11px] text-gray-400 dark:text-gray-500">
              {card.origem === 'portal_cliente' ? 'Portal do Cliente' : 'Interno'}
            </span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">

          {/* Título */}
          <div>
            <label className={LABEL}>Título</label>
            <input
              className={INPUT}
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              onBlur={() => titulo !== card.titulo && salvar({ titulo })}
              onKeyDown={e => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
            />
          </div>

          {/* Descrição */}
          <div>
            <label className={LABEL}>Descrição</label>
            <textarea
              className={`${INPUT} resize-y min-h-[80px]`}
              rows={3}
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              onBlur={() => descricao !== (card.descricao ?? '') && salvar({ descricao: descricao || null })}
              placeholder="Adicionar descrição..."
            />
          </div>

          {/* ── Etiquetas ── */}
          <div>
            <label className={LABEL}>Etiquetas</label>

            {/* Active label chips */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {cardEtiquetas.map(e => (
                <span
                  key={e.id}
                  className="flex items-center gap-1 text-[11px] font-semibold text-white px-2.5 py-1 rounded-full cursor-pointer hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: e.cor }}
                  onClick={() => handleToggleEtiqueta(e)}
                  title="Clique para remover"
                >
                  {e.nome || e.cor}
                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </span>
              ))}
              <div className="relative" ref={etiquetaMenuRef}>
                <button
                  onClick={() => { setShowEtiquetaMenu(v => !v); setEtiquetaEditId(null); setCriandoEtiqueta(false) }}
                  className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500 px-2.5 py-1 rounded-full border border-dashed border-gray-300 dark:border-white/10 hover:border-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Etiqueta
                </button>

                {showEtiquetaMenu && (
                  <div className="absolute left-0 top-full mt-1 z-30 w-64 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-2xl shadow-xl p-3 space-y-1">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Etiquetas do quadro</p>

                    {etiquetaEditId ? (
                      /* Edit mode */
                      <div className="space-y-3">
                        <input
                          className="w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/8 text-gray-900 dark:text-white rounded-xl px-3 py-2 text-sm outline-none focus:border-gold/50"
                          placeholder="Nome (opcional)"
                          value={etiquetaEditNome}
                          onChange={e => setEtiquetaEditNome(e.target.value)}
                          autoFocus
                        />
                        <div className="flex flex-wrap gap-1.5">
                          {PALETTE.map(cor => (
                            <button
                              key={cor}
                              className={`w-6 h-6 rounded-full transition-all ${etiquetaEditCor === cor ? 'ring-2 ring-offset-1 ring-gray-400 scale-110' : 'hover:scale-110'}`}
                              style={{ backgroundColor: cor }}
                              onClick={() => setEtiquetaEditCor(cor)}
                            />
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <button onClick={handleSalvarEtiqueta} className="flex-1 text-xs bg-gold text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-gold/90 transition-colors">Salvar</button>
                          <button
                            onClick={() => handleDeletarEtiqueta(etiquetaEditId)}
                            className="text-xs text-red-400 hover:text-red-600 px-2 py-1.5 rounded-lg border border-red-200 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                          </button>
                          <button onClick={() => setEtiquetaEditId(null)} className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1.5">Cancelar</button>
                        </div>
                      </div>
                    ) : criandoEtiqueta ? (
                      /* Create mode */
                      <div className="space-y-3">
                        <input
                          className="w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/8 text-gray-900 dark:text-white rounded-xl px-3 py-2 text-sm outline-none focus:border-gold/50"
                          placeholder="Nome (opcional)"
                          value={novaEtiquetaNome}
                          onChange={e => setNovaEtiquetaNome(e.target.value)}
                          autoFocus
                        />
                        <div className="flex flex-wrap gap-1.5">
                          {PALETTE.map(cor => (
                            <button
                              key={cor}
                              className={`w-6 h-6 rounded-full transition-all ${novaEtiquetaCor === cor ? 'ring-2 ring-offset-1 ring-gray-400 scale-110' : 'hover:scale-110'}`}
                              style={{ backgroundColor: cor }}
                              onClick={() => setNovaEtiquetaCor(cor)}
                            />
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <button onClick={handleCriarEtiqueta} className="flex-1 text-xs bg-gold text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-gold/90 transition-colors">Criar</button>
                          <button onClick={() => setCriandoEtiqueta(false)} className="text-xs text-gray-400 hover:text-gray-600 px-3 py-1.5">Cancelar</button>
                        </div>
                      </div>
                    ) : (
                      /* List mode */
                      <>
                        <div className="max-h-48 overflow-y-auto space-y-1 mb-2">
                          {etiquetasBoard.length === 0 && (
                            <p className="text-xs text-gray-400 text-center py-2">Nenhuma etiqueta criada</p>
                          )}
                          {etiquetasBoard.map(e => (
                            <div key={e.id} className="flex items-center gap-2 group">
                              <button
                                className={`flex-1 flex items-center gap-2 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left ${isEtiquetaAtiva(e.id) ? 'ring-1 ring-inset ring-gray-200 dark:ring-white/10' : ''}`}
                                onClick={() => handleToggleEtiqueta(e)}
                              >
                                <span className="w-5 h-5 rounded shrink-0 flex items-center justify-center" style={{ backgroundColor: e.cor }}>
                                  {isEtiquetaAtiva(e.id) && (
                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                    </svg>
                                  )}
                                </span>
                                <span className="text-xs text-gray-700 dark:text-gray-200 truncate">{e.nome || e.cor}</span>
                              </button>
                              <button
                                onClick={() => startEdit(e)}
                                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 transition-all rounded"
                              >
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>
                              </button>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => setCriandoEtiqueta(true)}
                          className="w-full text-xs text-gray-500 dark:text-gray-400 px-3 py-2 rounded-xl border border-dashed border-gray-300 dark:border-white/10 hover:border-gold/40 hover:text-gold transition-colors"
                        >
                          + Criar nova etiqueta
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Cliente */}
          <div>
            <label className={LABEL}>Cliente</label>
            <select
              className={SELECT}
              value={clienteId}
              onChange={e => { setClienteId(e.target.value); salvar({ cliente_id: e.target.value || null }) }}
            >
              <option value="">— Interno —</option>
              {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>

          {/* Responsável */}
          <div>
            <label className={LABEL}>Responsável</label>
            <select
              className={SELECT}
              value={responsavelId}
              onChange={e => { setResponsavelId(e.target.value); salvar({ responsavel_id: e.target.value || null }) }}
            >
              <option value="">— Sem responsável —</option>
              {usuarios.map(u => <option key={u.id} value={u.id}>{u.nome}{u.cargo ? ` — ${u.cargo}` : ''}</option>)}
            </select>
          </div>

          {/* Prioridade + Tipo */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL}>Prioridade</label>
              <select
                className={SELECT}
                value={prioridade}
                onChange={e => { setPrioridade(e.target.value); salvar({ prioridade: e.target.value }) }}
              >
                {PRIORIDADES.map(p => <option key={p} value={p}>{PRIORIDADE_LABEL[p]}</option>)}
              </select>
            </div>
            <div>
              <label className={LABEL}>Tipo</label>
              <input
                className={INPUT}
                value={tipo}
                onChange={e => setTipo(e.target.value)}
                onBlur={() => tipo !== (card.tipo ?? '') && salvar({ tipo: tipo || null })}
                placeholder="Bug, Feature..."
              />
            </div>
          </div>

          {/* Prazo */}
          <div>
            <label className={LABEL}>Prazo</label>
            <input
              type="date"
              className={INPUT}
              value={prazo}
              onChange={e => { setPrazo(e.target.value); salvar({ prazo: e.target.value || null }) }}
            />
          </div>

          {/* ── Comentários ── */}
          <div className="pt-2 border-t border-gray-100 dark:border-white/5">
            <label className={LABEL + ' mb-3'}>Comentários</label>

            {loadingComentarios ? (
              <div className="flex items-center justify-center py-4">
                <span className="w-4 h-4 border border-gold border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-3 mb-3">
                {comentarios.map(c => (
                  <div key={c.id} className="flex gap-2.5 group">
                    <div className="w-7 h-7 rounded-full bg-navy/80 text-white text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {c.usuario_nome ? c.usuario_nome.split(' ').map((p: string) => p[0]).slice(0, 2).join('').toUpperCase() : '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">{c.usuario_nome ?? 'Sistema'}</span>
                        <span className="text-[10px] text-gray-400">{formatDate(c.created_at)}</span>
                        <button
                          onClick={() => handleDeleteComentario(c.id)}
                          className="ml-auto opacity-0 group-hover:opacity-100 text-[10px] text-red-400 hover:text-red-600 transition-all"
                        >
                          excluir
                        </button>
                      </div>
                      <div className="bg-gray-50 dark:bg-[#0a0a0a] border border-gray-100 dark:border-white/5 rounded-xl px-3 py-2 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                        {c.conteudo}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add comment */}
            <div className="space-y-2">
              <textarea
                className={`${INPUT} resize-none`}
                rows={2}
                placeholder="Escrever um comentário..."
                value={novoComentario}
                onChange={e => setNovoComentario(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleAddComentario()
                }}
              />
              {novoComentario.trim() && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAddComentario}
                    disabled={submittingComentario}
                    className="text-xs bg-gold text-white px-4 py-1.5 rounded-lg font-semibold hover:bg-gold/90 transition-colors disabled:opacity-60"
                  >
                    {submittingComentario ? 'Enviando...' : 'Comentar'}
                  </button>
                  <button onClick={() => setNovoComentario('')} className="text-xs text-gray-400 hover:text-gray-600">
                    Cancelar
                  </button>
                  <span className="text-[10px] text-gray-400 ml-auto">Ctrl+Enter</span>
                </div>
              )}
            </div>
          </div>

          {/* Meta */}
          <div className="pt-2 border-t border-gray-100 dark:border-white/5 space-y-1">
            <p className="text-[11px] text-gray-400 dark:text-gray-600">
              Criado em {new Date(card.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
            {card.origem === 'portal_cliente' && (
              <p className="text-[11px] text-gold">Solicitação via Portal do Cliente</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 dark:border-white/5 flex items-center gap-3">
          {isPending && (
            <span className="text-[11px] text-gray-400 flex items-center gap-1.5">
              <span className="w-3 h-3 border border-gold border-t-transparent rounded-full animate-spin" />
              Salvando...
            </span>
          )}

          <button
            onClick={onClose}
            className="ml-auto flex items-center gap-1.5 text-sm font-semibold text-white bg-gold hover:bg-gold/90 px-5 py-2 rounded-xl transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Fechar
          </button>

          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <button onClick={() => setConfirmDelete(false)} className="text-xs text-gray-400 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5">Cancelar</button>
              <button onClick={handleExcluir} className="text-xs text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg font-semibold transition-colors">Excluir</button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10"
              title="Excluir card"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </>
  )
}
