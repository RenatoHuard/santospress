'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getDepoimentosNovos, type DepoimentoNovo } from '../actions/depoimentos'

type AgrupadoPorCliente = {
  clienteId: string
  clienteNome: string
  depoimentos: DepoimentoNovo[]
}

export function NotificacoesDepoimentos() {
  const [grupos, setGrupos] = useState<AgrupadoPorCliente[]>([])
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  useEffect(() => {
    getDepoimentosNovos().then((novos) => {
      const map = new Map<string, AgrupadoPorCliente>()
      for (const dep of novos) {
        if (!dep.cliente) continue
        const id = dep.cliente.id
        if (!map.has(id)) {
          map.set(id, {
            clienteId: id,
            clienteNome: dep.cliente.nome_fantasia ?? dep.cliente.razao_social,
            depoimentos: [],
          })
        }
        map.get(id)!.depoimentos.push(dep)
      }
      setGrupos(Array.from(map.values()))
    })
  }, [])

  const visiveis = grupos.filter(g => !dismissed.has(g.clienteId))
  if (visiveis.length === 0) return null

  return (
    <div className="border-b border-gray-100 dark:border-white/5 bg-white dark:bg-[#0d0d0d] px-6 py-3">
      <div className="max-w-5xl mx-auto flex flex-col gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-0.5">
          Novos Depoimentos
        </p>
        {visiveis.map((g) => (
          <div
            key={g.clienteId}
            className="flex items-center gap-3 bg-gold/5 dark:bg-gold/8 border border-gold/20 dark:border-gold/15 rounded-xl px-4 py-2.5"
          >
            <div className="w-7 h-7 rounded-lg bg-gold/15 dark:bg-gold/20 flex items-center justify-center shrink-0">
              <svg className="w-3.5 h-3.5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
              </svg>
            </div>

            <div className="flex-1 min-w-0">
              <span className="text-xs text-gray-700 dark:text-gray-300">
                <span className="font-semibold">{g.clienteNome}</span>
                {' '}enviou{' '}
                <span className="font-semibold text-gold">
                  {g.depoimentos.length === 1
                    ? '1 depoimento'
                    : `${g.depoimentos.length} depoimentos`}
                </span>
                {' '}aguardando revisão
              </span>
            </div>

            <Link
              href={`/sistema/cadastros/clientes/${g.clienteId}?tab=depoimentos`}
              className="text-xs font-semibold text-gold hover:text-gold/80 whitespace-nowrap transition-colors shrink-0"
            >
              Ver →
            </Link>

            <button
              type="button"
              onClick={() => setDismissed(prev => new Set([...prev, g.clienteId]))}
              title="Dispensar"
              className="text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 transition-colors shrink-0 ml-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
