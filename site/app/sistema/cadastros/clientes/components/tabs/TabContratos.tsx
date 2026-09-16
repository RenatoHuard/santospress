'use client'

import { useCallback, useEffect, useState, useTransition } from 'react'
import {
  getClienteContratos,
  salvarContrato,
  deletarContrato,
  uploadContratoArquivo,
  getContratoSignedUrl,
  type ContratoPayload,
} from '../../../../actions/clientes'
import {
  Section, Field, G2, G3, Feedback, TabLoader, inputCls,
} from '../../../funcionarios/components/tabs/_shared'

const STATUS_CONTRATO = ['ativo', 'encerrado', 'suspenso']

function blankContrato(): ContratoPayload {
  return { titulo: '', descricao: '', valor: '', data_inicio: '', data_fim: '', status: 'ativo', arquivo_url: '' }
}

function formatBRL(value: string) {
  const n = parseFloat(value)
  if (isNaN(n)) return 'â€”'
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

interface Props { clienteId: string }

type Contrato = ContratoPayload & { id: string; created_at?: string }

export function TabContratos({ clienteId }: Props) {
  const [contratos, setContratos] = useState<Contrato[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Contrato | null>(null)
  const [adding, setAdding] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [uploading, setUploading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const data = await getClienteContratos(clienteId)
    setContratos(data as unknown as Contrato[])
    setLoading(false)
  }, [clienteId])

  useEffect(() => { load() }, [load])

  function startAdd() {
    setAdding(true)
    setEditing({ ...blankContrato(), id: '' })
    setError(null)
    setSuccess(false)
  }

  function startEdit(c: Contrato) {
    setAdding(false)
    setEditing({ ...c, valor: c.valor?.toString() ?? '' })
    setError(null)
    setSuccess(false)
  }

  function cancel() {
    setEditing(null)
    setAdding(false)
  }

  async function handleUpload(file: File) {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('clienteId', clienteId)
      const json = await uploadContratoArquivo(fd)
      const { path } = JSON.parse(json)
      setEditing((prev) => prev ? { ...prev, arquivo_url: path } : prev)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro no upload')
    } finally {
      setUploading(false)
    }
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!editing) return
    setError(null)
    startTransition(async () => {
      try {
        await salvarContrato(clienteId, editing)
        setSuccess(true)
        setTimeout(() => setSuccess(false), 2500)
        cancel()
        await load()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao salvar')
      }
    })
  }

  async function handleDelete(id: string) {
    await deletarContrato(id)
    setContratos((prev) => prev.filter((c) => c.id !== id))
  }

  async function handleOpenFile(path: string) {
    try {
      const url = await getContratoSignedUrl(path)
      window.open(url, '_blank')
    } catch {
      setError('NÃ£o foi possÃ­vel abrir o arquivo.')
    }
  }

  if (loading) return <TabLoader />

  return (
    <div className="space-y-6">
      {/* Lista de contratos */}
      {contratos.length > 0 && (
        <div className="space-y-3">
          {contratos.map((c) => {
            const isEditing = editing?.id === c.id
            return (
              <div key={c.id} className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl p-5">
                {isEditing ? (
                  <ContratoForm
                    data={editing!}
                    onChange={(d) => setEditing(d as Contrato)}
                    onSave={handleSave}
                    onCancel={cancel}
                    onUpload={handleUpload}
                    uploading={uploading}
                    saving={isPending}
                    error={error}
                  />
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-gray-900 dark:text-white text-sm font-semibold truncate">{c.titulo}</p>
                        <span className={`text-[11px] px-2 py-0.5 rounded-full shrink-0 ${
                          c.status === 'ativo'      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                          c.status === 'encerrado'  ? 'bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-500' :
                                                      'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        }`}>
                          {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 text-xs text-gray-400 mt-1">
                        {c.valor && <span className="font-medium text-gray-600 dark:text-gray-300">{formatBRL(String(c.valor))}</span>}
                        {c.data_inicio && <span>InÃ­cio: {c.data_inicio}</span>}
                        {c.data_fim    && <span>Vence: {c.data_fim}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {c.arquivo_url && (
                        <button
                          type="button"
                          onClick={() => handleOpenFile(c.arquivo_url)}
                          className="flex items-center gap-1.5 text-xs text-gold hover:text-gold/80 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                          </svg>
                          Arquivo
                        </button>
                      )}
                      <button type="button" onClick={() => startEdit(c)} className="text-xs text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Editar</button>
                      <button type="button" onClick={() => handleDelete(c.id)} className="text-xs text-red-400 hover:text-red-600 transition-colors">Remover</button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {contratos.length === 0 && !adding && (
        <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl p-12 text-center">
          <p className="text-gray-400 dark:text-gray-600 text-sm">Nenhum contrato cadastrado.</p>
        </div>
      )}

      {/* FormulÃ¡rio novo */}
      {adding && editing && (
        <Section title="Novo Contrato">
          <ContratoForm
            data={editing}
            onChange={(d) => setEditing(d as Contrato)}
            onSave={handleSave}
            onCancel={cancel}
            onUpload={handleUpload}
            uploading={uploading}
            saving={isPending}
            error={error}
          />
        </Section>
      )}

      {success && <Feedback success />}

      {!adding && (
        <button
          type="button"
          onClick={startAdd}
          className="flex items-center gap-2 text-sm text-gold hover:text-gold/80 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Adicionar contrato
        </button>
      )}
    </div>
  )
}

// â”€â”€ FormulÃ¡rio de contrato â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function ContratoForm({
  data, onChange, onSave, onCancel, onUpload, uploading, saving, error,
}: {
  data: ContratoPayload & { id?: string }
  onChange: (d: ContratoPayload & { id?: string }) => void
  onSave: (e: React.FormEvent) => void
  onCancel: () => void
  onUpload: (f: File) => void
  uploading: boolean
  saving: boolean
  error: string | null
}) {
  function set(key: keyof ContratoPayload, value: string) {
    onChange({ ...data, [key]: value })
  }

  const inp = (key: keyof ContratoPayload, placeholder?: string, type = 'text') => (
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
        <Field label="TÃ­tulo" full>
          {inp('titulo', 'Nome do contrato')}
        </Field>
      </G2>
      <G3>
        <Field label="Valor (R$)">
          {inp('valor', '0,00', 'number')}
        </Field>
        <Field label="Status">
          <select value={data.status} onChange={(e) => set('status', e.target.value)} className={inputCls}>
            {STATUS_CONTRATO.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </Field>
      </G3>
      <G2>
        <Field label="Data de InÃ­cio">
          {inp('data_inicio', '', 'date')}
        </Field>
        <Field label="Data de Vencimento">
          {inp('data_fim', '', 'date')}
        </Field>
      </G2>
      <Field label="DescriÃ§Ã£o">
        <textarea
          value={data.descricao}
          onChange={(e) => set('descricao', e.target.value)}
          rows={2}
          className={inputCls}
          placeholder="Escopo, observaÃ§Ãµes..."
        />
      </Field>

      {/* Upload de arquivo */}
      <Field label="Arquivo do Contrato">
        <div className="flex items-center gap-3">
          <label className={`flex items-center gap-2 cursor-pointer px-4 py-3 rounded-xl border border-dashed border-gray-300 dark:border-white/10 hover:border-gold/50 transition-colors text-sm text-gray-400 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            {uploading ? 'Enviando...' : 'Selecionar arquivo (PDF, DOCX)'}
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
              disabled={uploading}
            />
          </label>
          {data.arquivo_url && (
            <span className="text-xs text-emerald-500 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Arquivo enviado
            </span>
          )}
        </div>
      </Field>

      {error && <Feedback error={error} />}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="bg-gold text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#9e2126] disabled:opacity-50 transition-colors flex items-center gap-2"
        >
          {saving && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
          {saving ? 'Salvando...' : 'Salvar contrato'}
        </button>
        <button type="button" onClick={onCancel} className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
          Cancelar
        </button>
      </div>
    </form>
  )
}
