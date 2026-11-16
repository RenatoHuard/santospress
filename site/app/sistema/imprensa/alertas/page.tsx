'use client'

import { useCallback, useEffect, useState } from 'react'
import { getAlertasJornalistas, getAlertasClientes, type JornalistaMetrica, type ClienteMetaMes } from '../../actions/imprensa'

type AlertaJornalista = JornalistaMetrica & { motivo: string }

export default function AlertasPage() {
  const [alertasJ, setAlertasJ] = useState<AlertaJornalista[]>([])
  const [alertasC, setAlertasC] = useState<ClienteMetaMes[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [j, c] = await Promise.all([getAlertasJornalistas(), getAlertasClientes()])
      setAlertasJ(j as AlertaJornalista[])
      setAlertasC(c)
    } catch {
      /* silencioso */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const semAlertas = alertasJ.length === 0 && alertasC.length === 0

  function fmtMes(d: string) {
    const [y, m] = d.split('-')
    const nomes = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
    return `${nomes[parseInt(m) - 1]} ${y}`
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Alertas</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Jornalistas sem resposta e clientes abaixo da meta</p>
        </div>
        <button onClick={load}
          className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-sm text-gray-500 hover:border-gold/50 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          Atualizar
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-7 h-7 border-2 border-gold border-t-transparent rounded-full animate-spin" /></div>
      ) : semAlertas ? (
        <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl flex flex-col items-center justify-center py-20 text-center">
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Tudo certo por agora</p>
          <p className="text-xs text-gray-400 mt-1">Nenhum alerta ativo para jornalistas ou clientes.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Alertas de jornalistas */}
          {alertasJ.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-400 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                Jornalistas com atenção ({alertasJ.length})
              </h2>
              <div className="space-y-2">
                {alertasJ.map(a => (
                  <div key={a.jornalista_id}
                    className="bg-white dark:bg-[#111] border border-amber-100 dark:border-amber-900/30 rounded-xl px-4 py-3 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{a.nome}</p>
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">{a.motivo}</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                        <span>{a.envios} envio{a.envios !== 1 ? 's' : ''}</span>
                        <span>{a.publicados} publicado{a.publicados !== 1 ? 's' : ''}</span>
                        <span>Taxa: {(a.taxa_publicacao * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alertas de clientes */}
          {alertasC.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-400 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
                Clientes abaixo da meta ({alertasC.length})
              </h2>
              <div className="space-y-2">
                {alertasC.map(c => (
                  <div key={c.cliente_id}
                    className="bg-white dark:bg-[#111] border border-red-100 dark:border-red-900/30 rounded-xl px-4 py-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900 dark:text-white">{c.cliente_nome}</p>
                        <span className="text-xs text-gray-400">{fmtMes(c.mes)}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs mt-1">
                        <span className="text-red-500 font-medium">{c.realizado} / {c.meta} clippings</span>
                        <span className="text-gray-400">({(c.percentual * 100).toFixed(0)}% da meta)</span>
                        <span className="text-gray-400">Ritmo esperado: {c.ritmo_esperado.toFixed(1)}</span>
                      </div>
                    </div>
                    <div className="w-20">
                      <div className="w-full bg-gray-100 dark:bg-white/5 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full bg-red-400 transition-all"
                          style={{ width: `${Math.min(c.percentual * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
