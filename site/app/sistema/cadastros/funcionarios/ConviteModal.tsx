'use client'

import { useState } from 'react'
import { criarConvite } from '@/app/sistema/actions/convites'

type Setor = { id: string; nome: string }

const ALL_ROLES = [
  { value: 'colaborador', label: 'Colaborador',   desc: 'Acesso ao próprio perfil' },
  { value: 'atendente',   label: 'Atendente',     desc: 'Perfil básico, sem dados de RH' },
  { value: 'gestor',      label: 'Gestor',        desc: 'Visualiza perfis da equipe' },
  { value: 'rh',          label: 'RH',            desc: 'Edita salário e benefícios da equipe' },
  { value: 'admin',       label: 'Administrador', desc: 'Acesso total ao sistema' },
]

interface Props {
  setores: Setor[]
  onClose: () => void
}

export function ConviteModal({ setores, onClose }: Props) {
  const [nome, setNome] = useState('')
  const [cargo, setCargo] = useState('')
  const [setorId, setSetorId] = useState('')
  const [roles, setRoles] = useState<string[]>(['colaborador'])

  function toggleRole(value: string) {
    setRoles(prev => {
      const has = prev.includes(value)
      const next = has ? prev.filter(r => r !== value) : [...prev, value]
      return next.length > 0 ? next : [value]
    })
  }
  const [loading, setLoading] = useState(false)
  const [link, setLink] = useState<string | null>(null)
  const [copiado, setCopiado] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function handleGerar() {
    setLoading(true)
    setErro(null)
    try {
      const token = await criarConvite({
        nome_sugerido: nome.trim() || undefined,
        cargo_sugerido: cargo.trim() || undefined,
        setor_id: setorId || undefined,
        roles,
      })
      const base = window.location.origin
      setLink(`${base}/convite/${token}`)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao gerar convite.')
    } finally {
      setLoading(false)
    }
  }

  function handleCopiar() {
    if (!link) return
    navigator.clipboard.writeText(link)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2500)
  }

  const INPUT = 'w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/8 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-gold/50 focus:ring-2 focus:ring-gold/15 transition text-gray-900 dark:text-white'
  const LABEL = 'block text-[10px] font-semibold tracking-widest uppercase text-gray-400 dark:text-gray-500 mb-1.5'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}>
      <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-100 dark:border-white/8"
        onClick={(e) => e.stopPropagation()}>

        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Convidar Colaborador</h3>
            <p className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">Gera um link único válido por 7 dias</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 dark:hover:text-white text-xl leading-none">×</button>
        </div>

        {!link ? (
          <div className="space-y-4">
            <div>
              <label className={LABEL}>Nome sugerido <span className="normal-case text-gray-400 font-normal">(opcional)</span></label>
              <input type="text" className={INPUT} placeholder="Ex.: Ana Silva"
                value={nome} onChange={(e) => setNome(e.target.value)} />
            </div>

            <div>
              <label className={LABEL}>Cargo sugerido <span className="normal-case text-gray-400 font-normal">(opcional)</span></label>
              <input type="text" className={INPUT} placeholder="Ex.: Redatora, Assessora de Imprensa"
                value={cargo} onChange={(e) => setCargo(e.target.value)} />
            </div>

            <div>
              <label className={LABEL}>Setor</label>
              <select className={INPUT} value={setorId} onChange={(e) => setSetorId(e.target.value)}>
                <option value="">Nenhum</option>
                {setores.map((s) => (
                  <option key={s.id} value={s.id}>{s.nome}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={LABEL}>Permissões <span className="normal-case font-normal text-gray-400">(selecione uma ou mais)</span></label>
              <div className="grid grid-cols-2 gap-1.5 mt-1">
                {ALL_ROLES.map((r) => {
                  const checked = roles.includes(r.value)
                  return (
                    <label
                      key={r.value}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors text-sm ${
                        checked
                          ? 'border-gold/60 bg-gold/8 dark:bg-gold/12 text-gray-900 dark:text-white'
                          : 'border-gray-200 dark:border-white/8 text-gray-500 dark:text-gray-400 hover:border-gray-300'
                      }`}
                    >
                      <input type="checkbox" checked={checked} onChange={() => toggleRole(r.value)} className="accent-gold shrink-0" />
                      <span className="font-medium">{r.label}</span>
                    </label>
                  )
                })}
              </div>
            </div>

            {erro && (
              <p className="text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/30 rounded-xl px-3 py-2">{erro}</p>
            )}

            <div className="flex gap-3 pt-1">
              <button onClick={onClose}
                className="flex-1 py-2.5 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-white border border-gray-200 dark:border-white/8 rounded-xl transition-colors">
                Cancelar
              </button>
              <button onClick={handleGerar} disabled={loading}
                className="flex-1 py-2.5 text-sm bg-gold text-white rounded-xl font-semibold hover:bg-gold/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                {loading && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                Gerar link
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/30 rounded-xl p-4">
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-2">Link gerado com sucesso!</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-500">Válido por 7 dias · uso único</p>
            </div>

            <div className="bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/8 rounded-xl p-3">
              <p className="text-xs text-gray-500 dark:text-gray-500 font-mono break-all leading-relaxed">{link}</p>
            </div>

            <button onClick={handleCopiar}
              className={`w-full py-2.5 text-sm rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                copiado
                  ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30'
                  : 'bg-gold text-white hover:bg-gold/90'
              }`}>
              {copiado ? (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Copiado!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copiar link
                </>
              )}
            </button>

            <button onClick={onClose}
              className="w-full py-2 text-sm text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors">
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
