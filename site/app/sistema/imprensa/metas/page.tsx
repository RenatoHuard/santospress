'use client'

import { useCallback, useEffect, useState, useTransition } from 'react'
import { getMetas, upsertMeta, deletarMeta, type Meta } from '../../actions/imprensa'
import { getClientes } from '../../actions/clientes'

const INPUT = 'w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/8 rounded-xl px-3 py-2 text-sm outline-none focus:border-gold/50 focus:ring-2 focus:ring-gold/15 transition'
const LABEL = 'block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1'

function fmtMes(d: string) {
  const [y, m] = d.split('-')
  const nomes = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
  return `${nomes[parseInt(m) - 1]} ${y}`
}

// Adiciona N meses a uma string "YYYY-MM", retornando "YYYY-MM"
function addMeses(ym: string, n: number): string {
  const [y, m] = ym.split('-').map(Number)
  const d = new Date(y, m - 1 + n, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

type ClienteOpt = { id: string; nome_fantasia: string | null; razao_social: string }
type FormData = { cliente_id: string; mes: string; meta: string; observacoes: string; replicar: number }
const EMPTY: FormData = { cliente_id: '', mes: '', meta: '', observacoes: '', replicar: 0 }

export default function MetasPage() {
  const [rows, setRows] = useState<Meta[]>([])
  const [clientes, setClientes] = useState<ClienteOpt[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState<FormData>(EMPTY)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const load = useCallback(async () => {
    setLoading(true)
    try { setRows(await getMetas()) } catch { /* silencioso */ } finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    getClientes().then(data => setClientes(data as ClienteOpt[])).catch(() => {})
  }, [])

  function abrirCriar() {
    // Pré-seleciona o mês atual
    const now = new Date()
    const mesAtual = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    setForm({ ...EMPTY, mes: mesAtual })
    setErro(null)
    setModal(true)
  }

  // Gera preview dos meses que serão criados
  const mesesPreview: string[] = (() => {
    if (!form.mes) return []
    const list = [form.mes]
    for (let i = 1; i <= form.replicar; i++) list.push(addMeses(form.mes, i))
    return list
  })()

  function handleSalvar() {
    if (!form.cliente_id) { setErro('Selecione um cliente.'); return }
    if (!form.mes) { setErro('Selecione o mês inicial.'); return }
    const metaNum = parseInt(form.meta)
    if (isNaN(metaNum) || metaNum < 0) { setErro('Meta deve ser um número >= 0.'); return }
    setErro(null)

    startTransition(async () => {
      try {
        // Salva todos os meses em paralelo (upsert — não sobrescreve se já existe meta maior)
        await Promise.all(
          mesesPreview.map(ym =>
            upsertMeta({
              cliente_id: form.cliente_id,
              mes: ym + '-01',
              meta: metaNum,
              observacoes: form.observacoes || undefined,
            })
          )
        )
        setModal(false)
        load()
      } catch (e) { setErro(e instanceof Error ? e.message : 'Erro ao salvar.') }
    })
  }

  function handleDeletar(id: string) {
    startTransition(async () => {
      try { await deletarMeta(id); setConfirmDelete(null); load() }
      catch { setConfirmDelete(null) }
    })
  }

  // Agrupar por cliente
  const porCliente = rows.reduce((acc, m) => {
    const key = m.cliente_nome ?? m.cliente_id
    if (!acc[key]) acc[key] = []
    acc[key].push(m)
    return acc
  }, {} as Record<string, Meta[]>)

  const nomeCliente = (c: ClienteOpt) => c.nome_fantasia || c.razao_social

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Metas Mensais</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Clippings esperados por cliente por mês</p>
        </div>
        <button onClick={abrirCriar}
          className="flex items-center gap-2 bg-gold text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gold/90 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nova Meta
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl text-center py-16 text-sm text-gray-400">
          Nenhuma meta cadastrada.
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(porCliente).map(([clienteNome, metas]) => (
            <div key={clienteNome} className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-50 dark:border-white/5">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{clienteNome}</h3>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-50 dark:border-white/5">
                    <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Mês</th>
                    <th className="text-right px-5 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Meta</th>
                    <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Observações</th>
                    <th className="px-5 py-2.5 w-10" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-white/3">
                  {metas.sort((a, b) => b.mes.localeCompare(a.mes)).map(m => (
                    <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-white/2 transition-colors">
                      <td className="px-5 py-3 font-medium text-gray-700 dark:text-gray-300">{fmtMes(m.mes)}</td>
                      <td className="px-5 py-3 text-right font-bold text-gold">{m.meta}</td>
                      <td className="px-5 py-3 text-gray-400 text-xs hidden md:table-cell">{m.observacoes ?? '—'}</td>
                      <td className="px-5 py-3 text-right">
                        <button onClick={() => setConfirmDelete(m.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      {/* Modal nova meta */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/5">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Nova Meta</h2>
              <button onClick={() => setModal(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5">
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Cliente */}
              <div>
                <label className={LABEL}>Cliente *</label>
                <select
                  className={INPUT}
                  value={form.cliente_id}
                  onChange={e => setForm(f => ({ ...f, cliente_id: e.target.value }))}>
                  <option value="">— selecione —</option>
                  {clientes.map(c => (
                    <option key={c.id} value={c.id}>{nomeCliente(c)}</option>
                  ))}
                </select>
              </div>

              {/* Mês + meta */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL}>Mês inicial *</label>
                  <input
                    type="month"
                    className={INPUT}
                    value={form.mes}
                    onChange={e => setForm(f => ({ ...f, mes: e.target.value }))}
                  />
                </div>
                <div>
                  <label className={LABEL}>Meta (clippings) *</label>
                  <input
                    type="number"
                    min={0}
                    className={INPUT}
                    value={form.meta}
                    onChange={e => setForm(f => ({ ...f, meta: e.target.value }))}
                    placeholder="ex: 10"
                  />
                </div>
              </div>

              {/* Replicar */}
              <div>
                <label className={LABEL}>Replicar para os próximos</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={11}
                    value={form.replicar}
                    onChange={e => setForm(f => ({ ...f, replicar: parseInt(e.target.value) }))}
                    className="flex-1 accent-gold"
                  />
                  <span className="text-sm font-semibold text-gold w-16 text-right">
                    {form.replicar === 0 ? 'apenas 1' : `+${form.replicar} ${form.replicar === 1 ? 'mês' : 'meses'}`}
                  </span>
                </div>
                {/* Preview dos meses */}
                {mesesPreview.length > 0 && form.mes && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {mesesPreview.map((ym, i) => (
                      <span
                        key={ym}
                        className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${i === 0 ? 'bg-gold/15 text-yellow-700 dark:text-yellow-400' : 'bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400'}`}>
                        {fmtMes(ym)}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Observações */}
              <div>
                <label className={LABEL}>Observações</label>
                <input
                  className={INPUT}
                  placeholder="Opcional"
                  value={form.observacoes}
                  onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))}
                />
              </div>

              {erro && (
                <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 rounded-xl px-3 py-2">{erro}</p>
              )}
            </div>

            <div className="flex items-center justify-between px-6 pb-6">
              <p className="text-xs text-gray-400">
                {mesesPreview.length} {mesesPreview.length === 1 ? 'mês será criado' : 'meses serão criados'}
              </p>
              <div className="flex gap-3">
                <button onClick={() => setModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-sm text-gray-600 dark:text-gray-400">
                  Cancelar
                </button>
                <button onClick={handleSalvar} disabled={isPending}
                  className="flex items-center gap-2 bg-gold text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-gold/90 disabled:opacity-50 transition-colors">
                  {isPending && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  Salvar {mesesPreview.length > 1 ? `${mesesPreview.length} meses` : ''}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm delete */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Excluir meta?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Esta ação não pode ser desfeita.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-sm text-gray-600">
                Cancelar
              </button>
              <button onClick={() => handleDeletar(confirmDelete!)} disabled={isPending}
                className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-50">
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
