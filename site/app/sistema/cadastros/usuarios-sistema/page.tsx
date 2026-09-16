'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { isSuperAdmin } from '../../actions/auth'
import { UsuariosSistemaClient } from './UsuariosSistemaClient'

export default function UsuariosSistemaPage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [denied, setDenied] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/login'); return }
      const ok = await isSuperAdmin(data.user.id)
      if (!ok) { setDenied(true); return }
      setReady(true)
    })
  }, [router])

  if (denied) {
    return (
      <div className="p-8 max-w-3xl">
        <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/30 rounded-xl p-6 text-red-700 dark:text-red-400">
          <p className="font-semibold">Acesso restrito</p>
          <p className="text-sm mt-1">Somente o superadmin pode gerenciar usuários do sistema.</p>
        </div>
      </div>
    )
  }

  if (!ready) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-7 h-7 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return <UsuariosSistemaClient />
}
