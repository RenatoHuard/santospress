'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getDashboardStats } from './actions'
import { getMeusRoles, podeAcessarAdmin, apenasPerfilProprio } from './actions/auth'
import { TopNav } from './components/TopNav'
import { RadialMenu } from './components/RadialMenu'
import { MeuMenuRadial } from './components/MeuMenuRadial'

interface Stats {
  clientesAtivos: number
  funcionariosAtivos: number
  configured: boolean
}

export default function DashboardPage() {
  const [roles, setRoles] = useState<string[] | null>(null)
  const [stats, setStats] = useState<Stats>({ clientesAtivos: 0, funcionariosAtivos: 0, configured: true })

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const r = await getMeusRoles(user.id)
      setRoles(r)
      if (podeAcessarAdmin(r)) {
        getDashboardStats().then(setStats)
      }
    })
  }, [])

  const isAdminPanel = roles !== null && podeAcessarAdmin(roles)
  const isPersonal   = roles !== null && apenasPerfilProprio(roles)

  return (
    <div className="flex flex-col min-h-screen">
      <TopNav />

      {isAdminPanel && !stats.configured && (
        <div className="bg-amber-50 dark:bg-amber-950/50 border-b border-amber-200 dark:border-amber-800/30 px-6 py-2.5 text-amber-700 dark:text-amber-400/90 text-xs text-center">
          Configure{' '}
          <code className="font-mono bg-amber-100 dark:bg-black/30 px-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code>
          {' '}no <code className="font-mono">.env.local</code> para ativar os dados reais.{' '}
          <span className="text-amber-500 dark:text-amber-600">Supabase → Settings → API → service_role</span>
        </div>
      )}

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-10 gap-10">
        {roles === null ? (
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        ) : isAdminPanel ? (
          <>
            <p className="text-gray-400 dark:text-gray-700 text-[10px] uppercase tracking-[0.25em] font-medium">
              Painel Administrativo
            </p>
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
            <RadialMenu />
          </>
        ) : isPersonal ? (
          <>
            <p className="text-gray-400 dark:text-gray-700 text-[10px] uppercase tracking-[0.25em] font-medium">
              Área Pessoal
            </p>
            <MeuMenuRadial />
          </>
        ) : (
          /* gestor, rh sem admin — futuramente terão menu próprio */
          <>
            <p className="text-gray-400 dark:text-gray-700 text-[10px] uppercase tracking-[0.25em] font-medium">
              Área Pessoal
            </p>
            <MeuMenuRadial />
          </>
        )}
      </main>
    </div>
  )
}
