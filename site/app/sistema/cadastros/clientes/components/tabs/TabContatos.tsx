'use client'

import { useCallback, useEffect, useState, useTransition } from 'react'
import {
  getClienteContatos,
  salvarContato,
  deletarContato,
  type ContatoPayload,
} from '../../../../actions/clientes'
import {
  Section, Field, G2, G3, TabLoader, Feedback, inputCls, MaskedInput,
} from '../../../funcionarios/components/tabs/_shared'
import {
  maskCPF, maskTelefone,
  validateCPF, validateTelefone, validateEmail,
} from '../../../funcionarios/components/tabs/_masks'

const TIPOS = [
  { value: 'responsavel_legal', label: 'Responsável Legal' },
  { value: 'interlocutor',      label: 'Interlocutor' },
]

function blankContato(): ContatoPayload {
  return { tipo: 'interlocutor', nome: '', cargo: '', cpf: '', telefone: '', whatsapp: '', email: '', observacoes: '', ordem: 0 }
}

interface Props { clienteId: string }

export function TabContatos({ clienteId }: Props) {
  const [contatos, setContatos] = useState<ContatoPayload[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<ContatoPayload | null>(null)
  const [adding, setAdding] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const data = await getClienteContatos(clienteId)
    setContatos(data as unknown as ContatoPayload[])
    setLoading(false)
  }, [clienteId])

  useEffect(() => { load() }, [load])

  function startAdd() {
    setAdding(true)
    setEditing(blankContato())
    setError(null)
    setSuccess(false)
  }

  function startEdit(c: ContatoPayload) {
    setAdding(false)
    setEditing({ ...c })
    setError(null)
    setSuccess(false)
  }

  function cancel() {
    setEditing(null)
    setAdding(false)
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!editing) return
    setError(null)
    startTransition(async () => {
      try {
        await salvarContato(clienteId, editing)
        setSuccess(true)
        setTimeout(() => setSuccess(false), 2500)
        setEditing(null)
        setAdding(false)
        await load()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao salvar')
      }
    })
  }

  async function handleDelete(id: string) {
    await deletarContato(id)
    setContatos((prev) => prev.filter((c) => (c as ContatoPayload & { id: string }).id !== id))
  }

  if (loading) return <TabLoader />

  return (
    <div className="space-y-6">
      {/* Lista */}
      {contatos.length > 0 && (
        <div className="space-y-3">
          {contatos.map((c) => {
            const ct = c as ContatoPayload & { id: string }
            const isEditing = editing && (editing as ContatoPayload & { id?: string }).id === ct.id
            return (
              <div key={ct.id} className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl p-5">
                {isEditing ? (
                  <ContatoForm
                    data={editing!}
                    onChange={(d) => setEditing(d)}
                    onSave={handleSave}
                    onCancel={cancel}
                    saving={isPending}
                    error={error}
                  />
                ) : (
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-gray-900 dark:text-white text-sm font-semibold">{ct.nome}</span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/8 text-gray-500 dark:text-gray-400">
                          {TIPOS.find((t) => t.value === ct.tipo)?.label ?? ct.tipo}
                        </span>
                      </div>
                      {ct.cargo && <p className="text-gray-500 text-xs">{ct.cargo}</p>}
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1.5 text-xs text-gray-400">
                        {ct.email    && <span>{ct.email}</span>}
                        {ct.telefone && <span>{ct.telefone}</span>}
                        {ct.whatsapp && <span>WA: {ct.whatsapp}</span>}
                      </div>
                    </div>
                    <div className="flex gap-3 shrink-0">
                      <button
                        type="button"
                        onClick={() => startEdit(ct)}
                        className="text-xs text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(ct.id)}
                        className="text-xs text-red-400 hover:text-red-600 transition-colors"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Formulário novo */}
      {adding && editing && (
        <Section title="Novo Contato">
          <form onSubmit={handleSave}>
            <ContatoForm
              data={editing}
              onChange={(d) => setEditing(d)}
              onSave={handleSave}
              onCancel={cancel}
              saving={isPending}
              error={error}
            />
          </form>
        </Section>
      )}

      {success && !error && (
        <Feedback success />
      )}

      {!adding && (
        <button
          type="button"
          onClick={startAdd}
          className="flex items-center gap-2 text-sm text-gold hover:text-gold/80 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Adicionar contato
        </button>
      )}
    </div>
  )
}

// ── Formulário de contato ──────────────────────────────────────────

function ContatoForm({
  data, onChange, onSave, onCancel, saving, error,
}: {
  data: ContatoPayload
  onChange: (d: ContatoPayload) => void
  onSave: (e: React.FormEvent) => void
  onCancel: () => void
  saving: boolean
  error: string | null
}) {
  function set(key: keyof ContatoPayload, value: string) {
    onChange({ ...data, [key]: value })
  }

  const inp = (key: keyof ContatoPayload, placeholder?: string, type = 'text') => (
    <input
      type={type}
      value={data[key] as string}
      onChange={(e) => set(key, e.target.value)}
      placeholder={placeholder}
      className={inputCls}
    />
  )

  return (
    <form onSubmit={onSave} className="space-y-5">
      <G2>
        <Field label="Tipo">
          <select value={data.tipo} onChange={(e) => set('tipo', e.target.value)} className={inputCls}>
            {TIPOS.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Nome" >
          {inp('nome', 'Nome completo')}
        </Field>
      </G2>
      <G2>
        <Field label="Cargo">
          {inp('cargo', 'Diretor, Gerente...')}
        </Field>
        {data.tipo === 'responsavel_legal' && (
          <Field label="CPF">
            <MaskedInput
              value={data.cpf as string}
              onChange={(v) => onChange({ ...data, cpf: v })}
              mask={maskCPF}
              validate={validateCPF}
              placeholder="000.000.000-00"
            />
          </Field>
        )}
      </G2>
      <G3>
        <Field label="Telefone">
          <MaskedInput
            value={data.telefone as string}
            onChange={(v) => onChange({ ...data, telefone: v })}
            mask={maskTelefone}
            validate={validateTelefone}
            placeholder="(00) 00000-0000"
            type="tel"
          />
        </Field>
        <Field label="WhatsApp">
          <MaskedInput
            value={data.whatsapp as string}
            onChange={(v) => onChange({ ...data, whatsapp: v })}
            mask={maskTelefone}
            validate={validateTelefone}
            placeholder="(00) 00000-0000"
            type="tel"
          />
        </Field>
        <Field label="E-mail">
          <MaskedInput
            value={data.email as string}
            onChange={(v) => onChange({ ...data, email: v })}
            validate={validateEmail}
            placeholder="nome@empresa.com"
            type="email"
          />
        </Field>
      </G3>
      <Field label="Observações">
        <textarea
          value={data.observacoes}
          onChange={(e) => set('observacoes', e.target.value)}
          rows={2}
          className={inputCls}
          placeholder="Notas sobre este contato..."
        />
      </Field>
      {error && <Feedback error={error} />}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="bg-gold text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#9e2126] disabled:opacity-50 transition-colors flex items-center gap-2"
        >
          {saving && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
          {saving ? 'Salvando...' : 'Salvar contato'}
        </button>
        <button type="button" onClick={onCancel} className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
          Cancelar
        </button>
      </div>
    </form>
  )
}
