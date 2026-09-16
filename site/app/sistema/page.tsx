'use client'

import { useEffect, useState } from 'react'
import { getDashboardStats } from './actions'
import { TopNav } from './components/TopNav'
import { RadialMenu } from './components/RadialMenu'

interface Stats {
  clientesAtivos: number
  funcionariosAtivos: number
  configured: boolean
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ clientesAtivos: 0, funcionariosAtivos: 0, configured: true })

  useEffect(() => {
    getDashboardStats().then(setStats)
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      <TopNav />

      {!stats.configured && (
        <div className="bg-amber-50 dark:bg-amber-950/50 border-b border-amber-200 dark:border-amber-800/30 px-6 py-2.5 text-amber-700 dark:text-amber-400/90 text-xs text-center">
          Configure{' '}
          <code className="font-mono bg-amber-100 dark:bg-black/30 px-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code>
          {' '}no <code className="font-mono">.env.local</code> para ativar os dados reais.{' '}
          <span className="text-amber-500 dark:text-amber-600">Supabase → Settings → API → service_role</span>
        </div>
      )}

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-10 gap-10">
        {/* Label */}
        <p className="text-gray-400 dark:text-gray-700 text-[10px] uppercase tracking-[0.25em] font-medium">
          Painel Administrativo
        </p>

        {/* Stats */}
        <div className="flex gap-4">
          <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none rounded-2xl px-10 py-5 text-center min-w-[160px]">
            <p className="text-5xl font-bold text-gold tabular-nums">{stats.clientesAtivos}</p>
            <p className="text-gray-400 dark:text-gray-500 text-xs mt-2 uppercase tracking-widest">Clientes Ativos</p>
          </div>
          <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none rounded-2xl px-10 py-5 text-center min-w-[160px]">
            <p className="text-5xl font-bold text-gold tabular-nums">{stats.funcionariosAtivos}</p>
            <p className="text-gray-400 dark:text-gray-500 text-xs mt-2 uppercase tracking-widest">Colaboradores Ativos</p>
          </div>
        </div>

        {/* Radial menu */}
        <RadialMenu />
      </main>
    </div>
  )
}
