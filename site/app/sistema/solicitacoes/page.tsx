'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getSolicitacoes, marcarComoVista, type Solicitacao } from '../actions/solicitacoes'
import { SolicitacaoCard } from '../components/SolicitacaoCard'

type Filtro = 'todas' | 'novas' | 'andamento' | 'concluidas'

const FILTROS: { key: Filtro; label: string }[] = [
  { key: 'todas',     label: 'Todas' },
  { key: 'novas',     label: 'Novas' },
  { key: 'andamento', label: 'Em Andamento' },
  { key: 'concluidas',label: 'Concluídas' },
]

function filtrar(lista: Solicitacao[], filtro: Filtro): Solicitacao[] {
  switch (filtro) {
    case 'novas':      return lista.filter(d => !d.visto_em)
    case 'andamento':  return lista.filter(d => d.visto_em && !d.concluida_em)
    case 'concluidas': return lista.filter(d => !!d.concluida_em)
    default:           return lista
  }
}

export default function SolicitacoesPage() {
  const router = useRouter()
  const [demandas, setDemandas] = useState<Solicitacao[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<Filtro>('todas')
  const [, startTransition] = useTransition()

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.replace('/login'); return }
      const data = await getSolicitacoes(user.id)
      setDemandas(data)
      setLoading(false)
    })
  }, [router])

  function handleVista(id: string) {
    setDemandas(prev => prev.map(d => d.id === id ? { ...d, visto_em: new Date().toISOString() } : d))
    startTransition(() => { marcarComoVista(id) })
  }

  const lista = filtrar(demandas, filtro)
  const counts: Record<Filtro, number> = {
    todas:      demandas.length,
    novas:      demandas.filter(d => !d.visto_em).length,
    andamento:  demandas.filter(d => d.visto_em && !d.concluida_em).length,
    concluidas: demandas.filter(d => !!d.concluida_em).length,
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">

      {/* Cabeçalho */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Solicitações</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Pedidos enviados pelos clientes via Portal do Cliente.
        </p>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-1 mb-6 flex-wrap">
        {FILTROS.map(f => (
          <button
            key={f.key}
            onClick={() => setFiltro(f.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filtro === f.key
                ? 'bg-gold text-white'
                : 'bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 text-gray-500 dark:text-gray-400 hover:border-gold/30'
            }`}
          >
            {f.label}
            {counts[f.key] > 0 && (
              <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${
                filtro === f.key
                  ? 'bg-white/20 text-white'
                  : f.key === 'novas'
                  ? 'bg-gold/10 text-gold'
                  : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400'
              }`}>
                {counts[f.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      {loading ? (
        <div className="flex items-center justify-center py-32">
          <div className="w-7 h-7 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      ) : lista.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            {filtro === 'todas' ? 'Nenhuma solicitação ainda' : `Nenhuma solicitação ${FILTROS.find(f => f.key === filtro)?.label.toLowerCase()}`}
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-600 mt-1">
            As solicitações enviadas pelo Portal do Cliente aparecerão aqui.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {lista.map(d => (
            <SolicitacaoCard
              key={d.id}
              demanda={d}
              onVista={handleVista}
            />
          ))}
        </div>
      )}
    </div>
  )
}
