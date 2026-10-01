'use client'

import { useCallback, useEffect, useState, useTransition } from 'react'
import { getDepoimentosCliente, toggleDepoimento, type Depoimento } from '../../../../../actions/depoimentos'

interface Props { clienteId: string }

export function TabDepoimentos({ clienteId }: Props) {
  const [depoimentos, setDepoimentos] = useState<Depoimento[]>([])
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const data = await getDepoimentosCliente(clienteId)
    setDepoimentos(data)
    setLoading(false)
  }, [clienteId])

  useEffect(() => { load() }, [load])

  function handleToggle(dep: Depoimento) {
    setTogglingId(dep.id)
    startTransition(async () => {
      await toggleDepoimento(dep.id, !dep.ativo)
      setDepoimentos((prev) =>
        prev.map((d) => d.id === dep.id ? { ...d, ativo: !dep.ativo } : d),
      )
      setTogglingId(null)
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-5 h-5 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (depoimentos.length === 0) {
    return (
      <div className="text-center py-16">
        <svg className="w-10 h-10 text-gray-200 dark:text-gray-700 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
        </svg>
        <p className="text-sm text-gray-400 dark:text-gray-600">Nenhum depoimento enviado ainda.</p>
        <p className="text-xs text-gray-300 dark:text-gray-700 mt-1">
          O cliente pode registrar pelo portal em Registrar Depoimento.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-400 dark:text-gray-600">
        Ative os depoimentos aprovados para que apareçam no site público.
      </p>

      {depoimentos.map((dep) => (
        <div
          key={dep.id}
          className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl p-5"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{dep.autor_nome}</span>
                {dep.autor_cargo && (
                  <span className="text-xs text-gray-400 dark:text-gray-500">· {dep.autor_cargo}</span>
                )}
                <span className={`ml-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                  dep.ativo
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/30'
                    : 'bg-gray-50 text-gray-400 border-gray-200 dark:bg-white/4 dark:text-gray-500 dark:border-white/8'
                }`}>
                  {dep.ativo ? 'Publicado' : 'Pendente'}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                &ldquo;{dep.texto}&rdquo;
              </p>
              <p className="text-xs text-gray-300 dark:text-gray-700 mt-2">
                {new Date(dep.criado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleToggle(dep)}
              disabled={isPending && togglingId === dep.id}
              title={dep.ativo ? 'Retirar do site' : 'Publicar no site'}
              className={`shrink-0 relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${
                dep.ativo ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-white/10'
              }`}
            >
              <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                dep.ativo ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
