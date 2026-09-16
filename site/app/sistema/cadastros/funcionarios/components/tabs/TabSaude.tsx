'use client'

import { useRef, useState, useEffect } from 'react'
import {
  getFuncSaude, saveFuncSaude,
  getFuncOcorrencias, addFuncOcorrencia, removeFuncOcorrencia,
  getFuncAtestados, addFuncAtestado, removeFuncAtestado,
  uploadColaboradorDoc,
} from '../../../../actions/rh'
import { inputCls, Section, Field, G2, G3, TabLoader, SaveBtn, Feedback } from './_shared'

const TIPOS_OCORRENCIA = [
  { value: 'doenca',       label: 'Afastamento por doença' },
  { value: 'acidente',     label: 'Acidente de trabalho' },
  { value: 'maternidade',  label: 'Licença-maternidade' },
  { value: 'paternidade',  label: 'Licença-paternidade' },
  { value: 'outros',       label: 'Outros' },
]

interface Ocorrencia {
  id: string; tipo: string; data_inicio: string; data_fim: string | null; descricao: string | null
}
interface Atestado {
  id: string; data: string; descricao: string | null; arquivo_url: string | null
}

const EMPTY_ASO = { aso_admissional_data: '', aso_periodico_data: '', aso_retorno_data: '' }
const EMPTY_OCO = { tipo: 'doenca', data_inicio: '', data_fim: '', descricao: '' }
const EMPTY_ATT = { data: '', descricao: '' }

function tipoLabel(v: string) { return TIPOS_OCORRENCIA.find((t) => t.value === v)?.label ?? v }

// ── Componente de upload de arquivo ──────────────────────────────
function FileUploadBtn({
  label, onUploaded, uploading, setUploading, usuarioId, tipo,
}: {
  label: string; onUploaded: (url: string) => void
  uploading: boolean; setUploading: (v: boolean) => void
  usuarioId: string; tipo: string
}) {
  const ref = useRef<HTMLInputElement>(null)

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('usuarioId', usuarioId)
      fd.append('tipo', tipo)
      const url = await uploadColaboradorDoc(fd)
      onUploaded(url)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro no upload')
    } finally {
      setUploading(false)
      if (ref.current) ref.current.value = ''
    }
  }

  return (
    <>
      <input ref={ref} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleChange} />
      <button
        type="button"
        disabled={uploading}
        onClick={() => ref.current?.click()}
        className="text-xs text-gold hover:text-[#9e2126] disabled:opacity-40 transition-colors flex items-center gap-1"
      >
        {uploading ? (
          <span className="w-3 h-3 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12V4m0 0L8 8m4-4l4 4" />
          </svg>
        )}
        {label}
      </button>
    </>
  )
}

function FileLink({ url }: { url: string | null }) {
  if (!url) return null
  const name = url.split('/').pop()?.split('?')[0] ?? 'arquivo'
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      className="text-xs text-gold hover:underline truncate max-w-[180px] block"
    >
      {name}
    </a>
  )
}

export function TabSaude({ usuarioId }: { usuarioId: string }) {
  const [loading, setLoading]       = useState(true)
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const [success, setSuccess]       = useState(false)
  const [form, setForm]             = useState({ ...EMPTY_ASO, aso_admissional_url: '', aso_periodico_url: '', aso_retorno_url: '' })
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([])
  const [newOco, setNewOco]         = useState(EMPTY_OCO)
  const [addingOco, setAddingOco]   = useState(false)
  const [ocoError, setOcoError]     = useState<string | null>(null)
  const [atestados, setAtestados]   = useState<Atestado[]>([])
  const [newAtt, setNewAtt]         = useState(EMPTY_ATT)
  const [addingAtt, setAddingAtt]   = useState(false)
  const [attError, setAttError]     = useState<string | null>(null)
  const [attArquivo, setAttArquivo] = useState<string | null>(null)
  const [uploading, setUploading]   = useState(false)

  const loadAtestados = () => getFuncAtestados(usuarioId).then((d) => setAtestados(d as Atestado[]))

  useEffect(() => {
    Promise.all([getFuncSaude(usuarioId), getFuncOcorrencias(usuarioId), getFuncAtestados(usuarioId)]).then(
      ([saude, ocos, atts]) => {
        if (saude) {
          setForm({
            aso_admissional_data: saude.aso_admissional_data ?? '',
            aso_periodico_data:   saude.aso_periodico_data ?? '',
            aso_retorno_data:     saude.aso_retorno_data ?? '',
            aso_admissional_url:  saude.aso_admissional_url ?? '',
            aso_periodico_url:    saude.aso_periodico_url ?? '',
            aso_retorno_url:      saude.aso_retorno_url ?? '',
          })
        }
        setOcorrencias(ocos as Ocorrencia[])
        setAtestados(atts as Atestado[])
        setLoading(false)
      }
    )
  }, [usuarioId])

  function set(field: string, value: string) { setForm((prev) => ({ ...prev, [field]: value })) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setError(null); setSuccess(false)
    try {
      await saveFuncSaude(usuarioId, form)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally { setSaving(false) }
  }

  async function handleAddOcorrencia() {
    if (!newOco.data_inicio) return
    setAddingOco(true); setOcoError(null)
    try {
      await addFuncOcorrencia(usuarioId, newOco)
      const ocos = await getFuncOcorrencias(usuarioId)
      setOcorrencias(ocos as Ocorrencia[])
      setNewOco(EMPTY_OCO)
    } catch (err) { setOcoError(err instanceof Error ? err.message : 'Erro ao adicionar') }
    finally { setAddingOco(false) }
  }

  async function handleRemoveOcorrencia(id: string) {
    await removeFuncOcorrencia(id)
    setOcorrencias((prev) => prev.filter((o) => o.id !== id))
  }

  async function handleAddAtestado() {
    if (!newAtt.data) return
    setAddingAtt(true); setAttError(null)
    try {
      await addFuncAtestado(usuarioId, { ...newAtt, arquivo_url: attArquivo ?? undefined })
      await loadAtestados()
      setNewAtt(EMPTY_ATT); setAttArquivo(null)
    } catch (err) { setAttError(err instanceof Error ? err.message : 'Erro ao adicionar') }
    finally { setAddingAtt(false) }
  }

  async function handleRemoveAtestado(id: string) {
    await removeFuncAtestado(id)
    setAtestados((prev) => prev.filter((a) => a.id !== id))
  }

  if (loading) return <TabLoader />

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Section title="Atestados de Saúde Ocupacional (ASO)">
        <G3>
          {(['admissional', 'periodico', 'retorno'] as const).map((tipo) => {
            const dataKey = `aso_${tipo}_data` as keyof typeof form
            const urlKey  = `aso_${tipo}_url`  as keyof typeof form
            const labels  = { admissional: 'ASO Admissional', periodico: 'ASO Periódico', retorno: 'ASO Retorno ao Trabalho' }
            return (
              <Field key={tipo} label={labels[tipo]}>
                <input type="date" className={inputCls}
                  value={form[dataKey]}
                  onChange={(e) => set(dataKey, e.target.value)} />
                <div className="mt-1.5 flex items-center gap-2">
                  {form[urlKey] ? (
                    <FileLink url={form[urlKey]} />
                  ) : (
                    <FileUploadBtn
                      label="Anexar PDF"
                      tipo={`aso-${tipo}`}
                      usuarioId={usuarioId}
                      uploading={uploading}
                      setUploading={setUploading}
                      onUploaded={(url) => set(urlKey, url)}
                    />
                  )}
                  {form[urlKey] && (
                    <button type="button" onClick={() => set(urlKey, '')}
                      className="text-xs text-gray-300 hover:text-red-400 transition-colors">×</button>
                  )}
                </div>
              </Field>
            )
          })}
        </G3>
      </Section>

      <Feedback error={error} success={success} />
      <SaveBtn saving={saving} />

      {/* Atestados médicos */}
      <Section title="Atestados Médicos">
        {atestados.length > 0 && (
          <div className="rounded-xl border border-gray-100 dark:border-white/5 overflow-hidden mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-white/3">
                  <th className="text-left px-4 py-2.5 text-gray-400 dark:text-gray-600 font-medium">Data</th>
                  <th className="text-left px-4 py-2.5 text-gray-400 dark:text-gray-600 font-medium hidden sm:table-cell">Descrição</th>
                  <th className="text-left px-4 py-2.5 text-gray-400 dark:text-gray-600 font-medium hidden sm:table-cell">Arquivo</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {atestados.map((a) => (
                  <tr key={a.id}>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{a.data}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 hidden sm:table-cell">{a.descricao ?? '—'}</td>
                    <td className="px-4 py-3 hidden sm:table-cell"><FileLink url={a.arquivo_url} /></td>
                    <td className="px-2 py-3">
                      <button type="button" onClick={() => handleRemoveAtestado(a.id)}
                        className="text-gray-300 dark:text-gray-700 hover:text-red-500 dark:hover:text-red-400 transition-colors" aria-label="Remover">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <G2>
          <Field label="Data do atestado">
            <input type="date" className={inputCls} value={newAtt.data}
              onChange={(e) => setNewAtt((p) => ({ ...p, data: e.target.value }))} />
          </Field>
          <Field label="Descrição">
            <input type="text" className={inputCls} placeholder="CID, observações..."
              value={newAtt.descricao}
              onChange={(e) => setNewAtt((p) => ({ ...p, descricao: e.target.value }))} />
          </Field>
        </G2>
        <div className="mt-2 flex items-center gap-4">
          {attArquivo ? (
            <span className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Arquivo pronto
              <button type="button" onClick={() => setAttArquivo(null)}
                className="text-gray-400 hover:text-red-400 transition-colors ml-1">×</button>
            </span>
          ) : (
            <FileUploadBtn
              label="Anexar arquivo"
              tipo="atestado"
              usuarioId={usuarioId}
              uploading={uploading}
              setUploading={setUploading}
              onUploaded={setAttArquivo}
            />
          )}
        </div>
        {attError && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{attError}</p>}
        <button type="button" disabled={addingAtt || !newAtt.data} onClick={handleAddAtestado}
          className="mt-3 text-sm text-gold hover:text-[#9e2126] disabled:opacity-40 transition-colors flex items-center gap-1.5">
          {addingAtt ? (
            <span className="w-3.5 h-3.5 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          )}
          Registrar atestado
        </button>
      </Section>

      {/* Ocorrências */}
      <Section title="Ocorrências e Afastamentos">
        {ocorrencias.length > 0 && (
          <div className="rounded-xl border border-gray-100 dark:border-white/5 overflow-hidden mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-white/3">
                  <th className="text-left px-4 py-2.5 text-gray-400 dark:text-gray-600 font-medium">Tipo</th>
                  <th className="text-left px-4 py-2.5 text-gray-400 dark:text-gray-600 font-medium hidden sm:table-cell">Início</th>
                  <th className="text-left px-4 py-2.5 text-gray-400 dark:text-gray-600 font-medium hidden sm:table-cell">Fim</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {ocorrencias.map((o) => (
                  <tr key={o.id}>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{tipoLabel(o.tipo)}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 hidden sm:table-cell">{o.data_inicio}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 hidden sm:table-cell">{o.data_fim ?? '—'}</td>
                    <td className="px-2 py-3">
                      <button type="button" onClick={() => handleRemoveOcorrencia(o.id)}
                        className="text-gray-300 dark:text-gray-700 hover:text-red-500 dark:hover:text-red-400 transition-colors" aria-label="Remover">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Tipo de ocorrência" full>
            <select className={inputCls} value={newOco.tipo}
              onChange={(e) => setNewOco((p) => ({ ...p, tipo: e.target.value }))}>
              {TIPOS_OCORRENCIA.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Data de início">
            <input type="date" className={inputCls} value={newOco.data_inicio}
              onChange={(e) => setNewOco((p) => ({ ...p, data_inicio: e.target.value }))} />
          </Field>
          <Field label="Data de retorno / fim">
            <input type="date" className={inputCls} value={newOco.data_fim}
              onChange={(e) => setNewOco((p) => ({ ...p, data_fim: e.target.value }))} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Descrição / observações">
              <input type="text" className={inputCls} placeholder="CID, número do CAT, observações..."
                value={newOco.descricao}
                onChange={(e) => setNewOco((p) => ({ ...p, descricao: e.target.value }))} />
            </Field>
          </div>
        </div>
        {ocoError && <p className="text-red-500 dark:text-red-400 text-sm">{ocoError}</p>}
        <button type="button" disabled={addingOco || !newOco.data_inicio} onClick={handleAddOcorrencia}
          className="mt-2 text-sm text-gold hover:text-[#9e2126] disabled:opacity-40 transition-colors flex items-center gap-1.5">
          {addingOco ? (
            <span className="w-3.5 h-3.5 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          )}
          Registrar ocorrência
        </button>
      </Section>
    </form>
  )
}
