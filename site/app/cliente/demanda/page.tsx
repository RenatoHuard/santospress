'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { criarDemandaCliente } from '../actions'

const INPUT =
  'w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/8 text-gray-900 dark:text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-gold/50 focus:ring-2 focus:ring-gold/15 transition placeholder:text-gray-400 dark:placeholder:text-gray-600'

const SELECT = INPUT + ' cursor-pointer'

const LABEL = 'block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5'

const TIPOS = [
  'Assessoria de Imprensa',
  'Produção de Conteúdo',
  'Gestão de Redes Sociais',
  'Publicidade',
  'Evento',
  'Outro',
]

const PRIORIDADES = [
  { value: 'baixa',  label: 'Baixa' },
  { value: 'media',  label: 'Média' },
  { value: 'alta',   label: 'Alta' },
  { value: 'urgente',label: 'Urgente' },
]

export default function NovaDemandaPage() {
  const router = useRouter()
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [tipo, setTipo] = useState(TIPOS[0])
  const [prioridade, setPrioridade] = useState('media')
  const [sucesso, setSucesso] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!titulo.trim() || !descricao.trim()) return

    startTransition(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/login'); return }

      const res = await criarDemandaCliente(user.id, { titulo, descricao, tipo, prioridade })
      if (res.sucesso) {
        setSucesso(true)
        setTitulo('')
        setDescricao('')
        setTipo(TIPOS[0])
        setPrioridade('media')
        setErro(null)
      } else {
        setErro(res.erro ?? 'Erro ao enviar demanda.')
      }
    })
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Nova Demanda</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Descreva sua solicitação com o máximo de detalhes possível para agilizar o atendimento.
        </p>
      </div>

      {sucesso && (
        <div className="flex items-start gap-3 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30 rounded-2xl px-5 py-4 mb-6">
          <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-semibold">Demanda enviada com sucesso!</p>
            <p className="text-emerald-500 dark:text-emerald-500 mt-0.5">Nossa equipe irá analisar sua solicitação e entrar em contato em breve.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl p-6 space-y-5">

        <div>
          <label className={LABEL}>Título da demanda</label>
          <input
            type="text"
            className={INPUT}
            placeholder="Ex: Pauta para assessoria de imprensa — lançamento produto X"
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
            required
            maxLength={120}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={LABEL}>Tipo</label>
            <select className={SELECT} value={tipo} onChange={e => setTipo(e.target.value)}>
              {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className={LABEL}>Prioridade</label>
            <select className={SELECT} value={prioridade} onChange={e => setPrioridade(e.target.value)}>
              {PRIORIDADES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className={LABEL}>Descrição</label>
          <textarea
            className={`${INPUT} resize-y min-h-[140px]`}
            placeholder="Descreva sua solicitação com detalhes: objetivo, prazo esperado, materiais disponíveis, referências…"
            value={descricao}
            onChange={e => setDescricao(e.target.value)}
            required
            rows={6}
          />
        </div>

        {erro && (
          <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/30 rounded-xl px-4 py-3">
            {erro}
          </div>
        )}

        <div className="flex items-center justify-between gap-4 pt-1">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Sua solicitação será encaminhada ao seu atendente automaticamente.
          </p>
          <button
            type="submit"
            disabled={isPending || !titulo.trim() || !descricao.trim()}
            className="shrink-0 px-6 py-2.5 bg-gold hover:bg-gold/90 disabled:opacity-60 text-white font-semibold text-sm rounded-xl transition-colors"
          >
            {isPending ? 'Enviando…' : 'Enviar demanda'}
          </button>
        </div>
      </form>
    </div>
  )
}
