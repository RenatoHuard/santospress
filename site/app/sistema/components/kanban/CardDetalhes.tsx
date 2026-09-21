'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import { atualizarCard, deletarCard, type KanbanCard, type UsuarioSimples, type ClienteSimples } from '../../actions/kanban'

const INPUT = 'w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/8 text-gray-900 dark:text-white rounded-xl px-3 py-2.5 text-sm outline-none focus:border-gold/50 focus:ring-2 focus:ring-gold/15 transition'
const SELECT = INPUT + ' cursor-pointer'
const LABEL = 'block text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5'

const PRIORIDADES = ['baixa', 'media', 'alta', 'urgente']
const PRIORIDADE_LABEL: Record<string, string> = { baixa: 'Baixa', media: 'Média', alta: 'Alta', urgente: 'Urgente' }

interface Props {
  card: KanbanCard | null
  usuarios: UsuarioSimples[]
  clientes: ClienteSimples[]
  onClose: () => void
  onUpdate: (cardId: string, dados: Partial<KanbanCard>) => void
  onDelete: (cardId: string) => void
}

export function CardDetalhes({ card, usuarios, clientes, onClose, onUpdate, onDelete }: Props) {
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [tipo, setTipo] = useState('')
  const [prioridade, setPrioridade] = useState('media')
  const [clienteId, setClienteId] = useState<string>('')
  const [responsavelId, setResponsavelId] = useState<string>('')
  const [prazo, setPrazo] = useState('')
  const [concluida, setConcluida] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

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
    setConfirmDelete(false)
  }, [card?.id])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

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

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-40 bg-black/20 dark:bg-black/40" onClick={onClose} />

      {/* Panel */}
      <div
        ref={panelRef}
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white dark:bg-[#111] shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/5">
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

          {/* Prioridade + Tipo em linha */}
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
                placeholder="Ex: Bug, Feature..."
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

        {/* Footer — delete */}
        <div className="px-5 py-4 border-t border-gray-100 dark:border-white/5">
          {isPending && (
            <p className="text-xs text-gray-400 mb-3 flex items-center gap-2">
              <span className="w-3 h-3 border border-gold border-t-transparent rounded-full animate-spin" />
              Salvando...
            </p>
          )}
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <p className="text-xs text-red-500 flex-1">Tem certeza? Esta ação não pode ser desfeita.</p>
              <button onClick={() => setConfirmDelete(false)} className="text-xs text-gray-400 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5">Cancelar</button>
              <button onClick={handleExcluir} className="text-xs text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg font-semibold transition-colors">Excluir</button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-2 text-xs text-red-400 hover:text-red-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
              Excluir card
            </button>
          )}
        </div>
      </div>
    </>
  )
}
