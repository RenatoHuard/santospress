'use client'

import { useState, useEffect } from 'react'
import {
  getFuncDocumentos, saveFuncDocumentos,
  getFuncDependentes, addFuncDependente, removeFuncDependente,
} from '../../../../actions/rh'
import { inputCls, Section, Field, G2, TabLoader, SaveBtn, Feedback, MaskedInput } from './_shared'
import { maskCPF, validateCPF } from './_masks'

const PARENTESCOS = ['Cônjuge', 'Filho(a)', 'Pai', 'Mãe', 'Outro']
const CNH_CATEGORIAS = ['A', 'B', 'AB', 'C', 'D', 'E']

interface Dependente {
  id: string
  nome: string
  data_nascimento: string | null
  cpf: string | null
  parentesco: string | null
}

const EMPTY_DOCS = {
  pis_pasep: '', ctps_numero: '', ctps_serie: '', titulo_eleitor: '',
  certificado_reservista: '', cnh_numero: '', cnh_categoria: '',
  cnh_validade: '', visto_trabalho: '', visto_validade: '',
}

const EMPTY_DEP = { nome: '', data_nascimento: '', cpf: '', parentesco: 'Filho(a)' }

export function TabDocumentacao({ usuarioId }: { usuarioId: string }) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState(EMPTY_DOCS)
  const [dependentes, setDependentes] = useState<Dependente[]>([])
  const [newDep, setNewDep] = useState(EMPTY_DEP)
  const [addingDep, setAddingDep] = useState(false)
  const [depError, setDepError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([getFuncDocumentos(usuarioId), getFuncDependentes(usuarioId)]).then(
      ([docs, deps]) => {
        if (docs) {
          setForm({
            pis_pasep: docs.pis_pasep ?? '',
            ctps_numero: docs.ctps_numero ?? '',
            ctps_serie: docs.ctps_serie ?? '',
            titulo_eleitor: docs.titulo_eleitor ?? '',
            certificado_reservista: docs.certificado_reservista ?? '',
            cnh_numero: docs.cnh_numero ?? '',
            cnh_categoria: docs.cnh_categoria ?? '',
            cnh_validade: docs.cnh_validade ?? '',
            visto_trabalho: docs.visto_trabalho ?? '',
            visto_validade: docs.visto_validade ?? '',
          })
        }
        setDependentes(deps as Dependente[])
        setLoading(false)
      }
    )
  }, [usuarioId])

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)
    try {
      await saveFuncDocumentos(usuarioId, form)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  async function handleAddDependente() {
    if (!newDep.nome.trim()) return
    setAddingDep(true)
    setDepError(null)
    try {
      await addFuncDependente(usuarioId, newDep)
      const deps = await getFuncDependentes(usuarioId)
      setDependentes(deps as Dependente[])
      setNewDep(EMPTY_DEP)
    } catch (err) {
      setDepError(err instanceof Error ? err.message : 'Erro ao adicionar')
    } finally {
      setAddingDep(false)
    }
  }

  async function handleRemoveDependente(id: string) {
    await removeFuncDependente(id)
    setDependentes((prev) => prev.filter((d) => d.id !== id))
  }

  if (loading) return <TabLoader />

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Section title="Registros Oficiais">
        <G2>
          <Field label="PIS / PASEP">
            <input type="text" className={inputCls} placeholder="000.00000.00-0" maxLength={14}
              value={form.pis_pasep} onChange={(e) => set('pis_pasep', e.target.value)} />
          </Field>
          <Field label="Título de Eleitor">
            <input type="text" className={inputCls}
              value={form.titulo_eleitor} onChange={(e) => set('titulo_eleitor', e.target.value)} />
          </Field>
          <Field label="CTPS — Número">
            <input type="text" className={inputCls}
              value={form.ctps_numero} onChange={(e) => set('ctps_numero', e.target.value)} />
          </Field>
          <Field label="CTPS — Série">
            <input type="text" className={inputCls}
              value={form.ctps_serie} onChange={(e) => set('ctps_serie', e.target.value)} />
          </Field>
          <Field label="Certificado de Reservista">
            <input type="text" className={inputCls} placeholder="Nº do certificado"
              value={form.certificado_reservista}
              onChange={(e) => set('certificado_reservista', e.target.value)} />
          </Field>
        </G2>
      </Section>

      <Section title="CNH (se a função exigir)">
        <G2>
          <Field label="Número da CNH">
            <input type="text" className={inputCls}
              value={form.cnh_numero} onChange={(e) => set('cnh_numero', e.target.value)} />
          </Field>
          <Field label="Categoria">
            <select className={inputCls} value={form.cnh_categoria}
              onChange={(e) => set('cnh_categoria', e.target.value)}>
              <option value="">—</option>
              {CNH_CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Validade da CNH">
            <input type="date" className={inputCls}
              value={form.cnh_validade} onChange={(e) => set('cnh_validade', e.target.value)} />
          </Field>
        </G2>
      </Section>

      <Section title="Visto de Trabalho (estrangeiros)">
        <G2>
          <Field label="Tipo de visto">
            <input type="text" className={inputCls} placeholder="Ex.: VITEM V"
              value={form.visto_trabalho} onChange={(e) => set('visto_trabalho', e.target.value)} />
          </Field>
          <Field label="Validade do visto">
            <input type="date" className={inputCls}
              value={form.visto_validade} onChange={(e) => set('visto_validade', e.target.value)} />
          </Field>
        </G2>
      </Section>

      <Feedback error={error} success={success} />
      <SaveBtn saving={saving} />

      {/* Dependentes — seção separada */}
      <Section title="Dependentes">
        {dependentes.length > 0 && (
          <div className="rounded-xl border border-gray-100 dark:border-white/5 overflow-hidden mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-white/3">
                  <th className="text-left px-4 py-2.5 text-gray-400 dark:text-gray-600 font-medium">Nome</th>
                  <th className="text-left px-4 py-2.5 text-gray-400 dark:text-gray-600 font-medium hidden sm:table-cell">Parentesco</th>
                  <th className="text-left px-4 py-2.5 text-gray-400 dark:text-gray-600 font-medium hidden sm:table-cell">CPF</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {dependentes.map((d) => (
                  <tr key={d.id}>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{d.nome}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 hidden sm:table-cell">{d.parentesco ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 hidden sm:table-cell">{d.cpf ?? '—'}</td>
                    <td className="px-2 py-3">
                      <button
                        type="button"
                        onClick={() => handleRemoveDependente(d.id)}
                        className="text-gray-300 dark:text-gray-700 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                        aria-label="Remover"
                      >
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
          <Field label="Nome do dependente">
            <input type="text" className={inputCls} placeholder="Nome completo"
              value={newDep.nome} onChange={(e) => setNewDep((p) => ({ ...p, nome: e.target.value }))} />
          </Field>
          <Field label="Parentesco">
            <select className={inputCls} value={newDep.parentesco}
              onChange={(e) => setNewDep((p) => ({ ...p, parentesco: e.target.value }))}>
              {PARENTESCOS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </Field>
          <Field label="Data de nascimento">
            <input type="date" className={inputCls}
              value={newDep.data_nascimento}
              onChange={(e) => setNewDep((p) => ({ ...p, data_nascimento: e.target.value }))} />
          </Field>
          <Field label="CPF">
            <MaskedInput
              value={newDep.cpf}
              onChange={(v) => setNewDep((p) => ({ ...p, cpf: v }))}
              mask={maskCPF}
              validate={validateCPF}
              placeholder="000.000.000-00"
            />
          </Field>
        </div>

        {depError && (
          <p className="text-red-500 dark:text-red-400 text-sm">{depError}</p>
        )}

        <button
          type="button"
          disabled={addingDep || !newDep.nome.trim()}
          onClick={handleAddDependente}
          className="mt-2 text-sm text-gold hover:text-[#9e2126] disabled:opacity-40 transition-colors flex items-center gap-1.5"
        >
          {addingDep ? (
            <span className="w-3.5 h-3.5 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          )}
          Adicionar dependente
        </button>
      </Section>
    </form>
  )
}
