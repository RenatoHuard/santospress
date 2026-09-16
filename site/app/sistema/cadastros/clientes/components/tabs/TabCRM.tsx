'use client'

import { useCallback, useEffect, useState, useTransition } from 'react'
import {
  getClienteCRM,
  addCRMEntry,
  type CRMPayload,
} from '../../../../actions/clientes'
import { getFuncionariosBasico } from '../../../../actions/blog'
import { TabLoader, Feedback, inputCls } from '../../../funcionarios/components/tabs/_shared'

const TIPOS_CRM = [
  { value: 'nota',      label: 'Nota',         color: 'bg-gray-100 text-gray-600 dark:bg-white/8 dark:text-gray-400' },
  { value: 'reuniao',   label: 'Reunião',       color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  { value: 'campanha',  label: 'Campanha',      color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  { value: 'briefing',  label: 'Briefing',      color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  { value: 'aprovacao', label: 'Aprovação',     color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
]


function formatDate(d: string) {
  if (!d) return ''
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}

interface Props { clienteId: string }

type CRMEntry = CRMPayload & { id: string; created_at?: string; responsavel?: { nome: string } }
type Funcionario = { id: string; nome: string; email: string }

export function TabCRM({ clienteId }: Props) {
  const [entries, setEntries] = useState<CRMEntry[]>([])
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const today = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState<CRMPayload>({
    tipo: 'nota',
    titulo: '',
    descricao: '',
    data: today,
    responsavel_id: '',
  })

  const load = useCallback(async () => {
    setLoading(true)
    const [data, funcs] = await Promise.all([
      getClienteCRM(clienteId),
      getFuncionariosBasico().catch(() => []),
    ])
    setEntries(data as unknown as CRMEntry[])
    setFuncionarios(funcs as Funcionario[])
    setLoading(false)
  }, [clienteId])

  useEffect(() => { load() }, [load])

  function setF(key: keyof CRMPayload, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      try {
        await addCRMEntry(clienteId, form)
        setSuccess(true)
        setAdding(false)
        setForm({ tipo: 'nota', titulo: '', descricao: '', data: today, responsavel_id: '' })
        setTimeout(() => setSuccess(false), 2500)
        await load()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao salvar')
      }
    })
  }

  if (loading) return <TabLoader />

  return (
    <div className="space-y-6">
      {/* Timeline */}
      {entries.length === 0 && !adding && (
        <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl p-12 text-center">
          <p className="text-gray-400 dark:text-gray-600 text-sm">Nenhum registro no histórico.</p>
        </div>
      )}

      {entries.length > 0 && (
        <div className="relative pl-8 space-y-0">
          {/* Linha vertical */}
          <div className="absolute left-[14px] top-2 bottom-2 w-px bg-gray-100 dark:bg-white/5" />

          {entries.map((entry) => {
            const tipo = TIPOS_CRM.find((t) => t.value === entry.tipo) ?? TIPOS_CRM[0]
            return (
              <div key={entry.id} className="relative pb-6 last:pb-0">
                {/* Ponto na linha */}
                <div className="absolute -left-8 top-1.5 w-3 h-3 rounded-full border-2 border-white dark:border-[#0a0a0a] bg-gold" />

                <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${tipo.color}`}>
                        {tipo.label}
                      </span>
                      {entry.titulo && (
                        <p className="text-gray-900 dark:text-white text-sm font-medium">{entry.titulo}</p>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 shrink-0">{formatDate(entry.data)}</span>
                  </div>
                  {entry.descricao && (
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 whitespace-pre-line">{entry.descricao}</p>
                  )}
                  {entry.responsavel?.nome && (
                    <p className="text-xs text-gray-400 mt-2">por {entry.responsavel.nome}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Formulário novo registro */}
      {adding && (
        <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl p-5">
          <h4 className="text-xs text-gray-400 dark:text-gray-600 uppercase tracking-widest mb-4">Novo Registro</h4>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1.5">Tipo</label>
                <select value={form.tipo} onChange={(e) => setF('tipo', e.target.value)} className={inputCls}>
                  {TIPOS_CRM.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1.5">Data</label>
                <input type="date" value={form.data} onChange={(e) => setF('data', e.target.value)} className={inputCls} />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1.5">Título</label>
              <input
                type="text"
                value={form.titulo}
                onChange={(e) => setF('titulo', e.target.value)}
                placeholder="Resumo breve"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1.5">Descrição</label>
              <textarea
                value={form.descricao}
                onChange={(e) => setF('descricao', e.target.value)}
                rows={3}
                placeholder="Detalhes, links, resultados..."
                className={inputCls}
              />
            </div>
            {funcionarios.length > 0 && (
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1.5">Responsável</label>
                <select value={form.responsavel_id} onChange={(e) => setF('responsavel_id', e.target.value)} className={inputCls}>
                  <option value="">Selecionar responsável</option>
                  {funcionarios.map((f) => (
                    <option key={f.id} value={f.id}>{f.nome}</option>
                  ))}
                </select>
              </div>
            )}
            {error && <Feedback error={error} />}
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={isPending}
                className="bg-gold text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#9e2126] disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {isPending && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                {isPending ? 'Salvando...' : 'Registrar'}
              </button>
              <button
                type="button"
                onClick={() => { setAdding(false); setError(null) }}
                className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {success && <Feedback success />}

      {!adding && (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 text-sm text-gold hover:text-gold/80 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Adicionar registro
        </button>
      )}
    </div>
  )
}
