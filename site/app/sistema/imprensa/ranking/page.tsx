'use client'

import { useCallback, useEffect, useState } from 'react'
import { getMetricasJornalistas, type JornalistaMetrica } from '../../actions/imprensa'

function fmt(n: number, digits = 1) {
  return n.toFixed(digits)
}

function pct(n: number) {
  return `${(n * 100).toFixed(0)}%`
}

export default function RankingPage() {
  const [rows, setRows] = useState<JornalistaMetrica[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [ordenar, setOrdenar] = useState<'envios' | 'publicados' | 'taxa_publicacao' | 'taxa_resposta'>('publicados')

  const load = useCallback(async (q = busca) => {
    setLoading(true)
    try {
      const data = await getMetricasJornalistas({ busca: q || undefined, situacao: 'ativo' })
      setRows(data)
    } catch {
      /* silencioso */
    } finally {
      setLoading(false)
    }
  }, [busca])

  useEffect(() => { load() }, [])

  const ordenado = [...rows].sort((a, b) => (b[ordenar] as number) - (a[ordenar] as number))

  const col = (label: string, key: typeof ordenar) => (
    <th
      className={`text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer select-none transition-colors ${ordenar === key ? 'text-gold' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
      onClick={() => setOrdenar(key)}>
      {label} {ordenar === key && '↓'}
    </th>
  )

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Ranking de Jornalistas</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Baseado na janela de envios configurada</p>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-3">
        <input
          type="text" placeholder="Filtrar por nome…" value={busca}
          onChange={e => { setBusca(e.target.value); load(e.target.value) }}
          className="flex-1 min-w-[200px] bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-gold/50"
        />
      </div>

      <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><div className="w-7 h-7 border-2 border-gold border-t-transparent rounded-full animate-spin" /></div>
        ) : ordenado.length === 0 ? (
          <div className="text-center py-16 text-sm text-gray-400">Nenhum dado disponível.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/5">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-8">#</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Jornalista</th>
                  {col('Envios', 'envios')}
                  {col('Publicados', 'publicados')}
                  {col('Taxa publicação', 'taxa_publicacao')}
                  {col('Taxa resposta', 'taxa_resposta')}
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Último envio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-white/3">
                {ordenado.map((j, i) => (
                  <tr key={j.jornalista_id} className="hover:bg-gray-50 dark:hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">{i + 1}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 dark:text-white">{j.nome}</p>
                      {j.envios_seguidos_sem_resposta >= 3 && (
                        <span className="text-xs text-amber-500">⚠ {j.envios_seguidos_sem_resposta}× sem resposta</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">{j.envios}</td>
                    <td className="px-4 py-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">{j.publicados}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={j.taxa_publicacao >= 0.1 ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-red-400'}>
                        {pct(j.taxa_publicacao)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">{pct(j.taxa_resposta)}</td>
                    <td className="px-4 py-3 text-right text-xs text-gray-400 hidden lg:table-cell">
                      {j.ultimo_envio ? new Date(j.ultimo_envio).toLocaleDateString('pt-BR') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
