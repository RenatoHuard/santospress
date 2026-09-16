'use client'

import { useRef, useState, useEffect } from 'react'
import {
  getFuncBancario,
  getFuncNotasServico, addFuncNotaServico, removeFuncNotaServico,
  uploadColaboradorDoc,
} from '../actions/rh'
import { inputCls, Section, Field, G2, TabLoader } from '../cadastros/funcionarios/components/tabs/_shared'

interface Nota {
  id: string; data: string; descricao: string | null; valor: number | null; arquivo_url: string | null
}

const BENEFICIOS_MAP: Record<string, string> = {
  beneficio_vt:    'Vale-Transporte (VT)',
  beneficio_va:    'Vale-Alimentação (VA)',
  beneficio_vr:    'Vale-Refeição (VR)',
  beneficio_saude: 'Plano de Saúde',
  beneficio_odonto:'Plano Odontológico',
}

const EMPTY_NOTA = { data: '', descricao: '', valor: '' }

function FileLink({ url }: { url: string | null }) {
  if (!url) return null
  const name = url.split('/').pop()?.split('?')[0] ?? 'arquivo'
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      className="text-xs text-gold hover:underline truncate max-w-[180px] block">
      {name}
    </a>
  )
}

function FileUploadBtn({ onUploaded, usuarioId }: { onUploaded: (url: string) => void; usuarioId: string }) {
  const ref = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file); fd.append('usuarioId', usuarioId); fd.append('tipo', 'notas-servico')
      const url = await uploadColaboradorDoc(fd)
      onUploaded(url)
    } catch (err) { alert(err instanceof Error ? err.message : 'Erro no upload') }
    finally { setUploading(false); if (ref.current) ref.current.value = '' }
  }

  return (
    <>
      <input ref={ref} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleChange} />
      <button type="button" disabled={uploading} onClick={() => ref.current?.click()}
        className="text-xs text-gold hover:text-[#9e2126] disabled:opacity-40 transition-colors flex items-center gap-1">
        {uploading ? <span className="w-3 h-3 border-2 border-gold border-t-transparent rounded-full animate-spin" /> : (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12V4m0 0L8 8m4-4l4 4" />
          </svg>
        )}
        Anexar nota (PDF/imagem)
      </button>
    </>
  )
}

export function MinhaFinanceiro({ usuarioId }: { usuarioId: string }) {
  const [loading, setLoading]     = useState(true)
  const [beneficios, setBeneficios] = useState<string[]>([])
  const [notas, setNotas]         = useState<Nota[]>([])
  const [newNota, setNewNota]     = useState(EMPTY_NOTA)
  const [notaArquivo, setNotaArquivo] = useState<string | null>(null)
  const [adding, setAdding]       = useState(false)
  const [addError, setAddError]   = useState<string | null>(null)

  const loadNotas = () => getFuncNotasServico(usuarioId).then((d) => setNotas(d as Nota[]))

  useEffect(() => {
    Promise.all([getFuncBancario(usuarioId), getFuncNotasServico(usuarioId)]).then(([banc, nts]) => {
      if (banc) {
        const ativos = Object.keys(BENEFICIOS_MAP).filter((k) => (banc as Record<string, unknown>)[k] === true)
        setBeneficios(ativos)
      }
      setNotas(nts as Nota[])
      setLoading(false)
    })
  }, [usuarioId])

  async function handleAddNota() {
    if (!newNota.data) return
    setAdding(true); setAddError(null)
    try {
      await addFuncNotaServico(usuarioId, {
        data: newNota.data,
        descricao: newNota.descricao || undefined,
        valor: newNota.valor ? parseFloat(newNota.valor) : null,
        arquivo_url: notaArquivo ?? undefined,
      })
      await loadNotas()
      setNewNota(EMPTY_NOTA); setNotaArquivo(null)
    } catch (err) { setAddError(err instanceof Error ? err.message : 'Erro ao registrar') }
    finally { setAdding(false) }
  }

  if (loading) return <TabLoader />

  return (
    <div className="space-y-6">
      {/* Benefícios ativos (view-only) */}
      {beneficios.length > 0 && (
        <Section title="Benefícios Ativos">
          <div className="flex flex-wrap gap-2">
            {beneficios.map((k) => (
              <span key={k} className="px-3 py-1.5 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-medium">
                {BENEFICIOS_MAP[k]}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* Notas de serviço */}
      <Section title="Notas de Serviço">
        {notas.length > 0 && (
          <div className="rounded-xl border border-gray-100 dark:border-white/5 overflow-hidden mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-white/3">
                  <th className="text-left px-4 py-2.5 text-gray-400 dark:text-gray-600 font-medium">Data</th>
                  <th className="text-left px-4 py-2.5 text-gray-400 dark:text-gray-600 font-medium hidden sm:table-cell">Descrição</th>
                  <th className="text-left px-4 py-2.5 text-gray-400 dark:text-gray-600 font-medium hidden sm:table-cell">Valor</th>
                  <th className="text-left px-4 py-2.5 text-gray-400 dark:text-gray-600 font-medium hidden sm:table-cell">Arquivo</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {notas.map((n) => (
                  <tr key={n.id}>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{n.data}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 hidden sm:table-cell">{n.descricao ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                      {n.valor != null ? `R$ ${n.valor.toFixed(2)}` : '—'}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell"><FileLink url={n.arquivo_url} /></td>
                    <td className="px-2 py-3">
                      <button type="button"
                        onClick={() => removeFuncNotaServico(n.id).then(loadNotas)}
                        className="text-gray-300 dark:text-gray-700 hover:text-red-500 transition-colors" aria-label="Remover">
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

        {/* Formulário nova nota */}
        <div className="bg-gray-50 dark:bg-white/3 rounded-xl p-4 space-y-4">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-wider">
            Nova nota de serviço
          </p>
          <G2>
            <Field label="Data de competência">
              <input type="date" className={inputCls} value={newNota.data}
                onChange={(e) => setNewNota((p) => ({ ...p, data: e.target.value }))} />
            </Field>
            <Field label="Valor (R$)">
              <input type="number" min="0" step="0.01" placeholder="0,00" className={inputCls}
                value={newNota.valor}
                onChange={(e) => setNewNota((p) => ({ ...p, valor: e.target.value }))} />
            </Field>
          </G2>
          <Field label="Descrição / referência">
            <input type="text" className={inputCls} placeholder="Ex.: Nota Fiscal nº 1234, período..."
              value={newNota.descricao}
              onChange={(e) => setNewNota((p) => ({ ...p, descricao: e.target.value }))} />
          </Field>

          <div className="flex items-center gap-4">
            {notaArquivo ? (
              <span className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Arquivo pronto
                <button type="button" onClick={() => setNotaArquivo(null)}
                  className="text-gray-400 hover:text-red-400 ml-1">×</button>
              </span>
            ) : (
              <FileUploadBtn usuarioId={usuarioId} onUploaded={setNotaArquivo} />
            )}
          </div>

          {addError && <p className="text-red-500 text-sm">{addError}</p>}

          <button type="button" disabled={adding || !newNota.data} onClick={handleAddNota}
            className="bg-gold text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-[#9e2126] disabled:opacity-50 transition-colors flex items-center gap-2">
            {adding && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
            {adding ? 'Enviando...' : 'Registrar nota'}
          </button>
        </div>
      </Section>
    </div>
  )
}
