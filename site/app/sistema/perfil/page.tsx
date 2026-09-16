'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getMeuUsuarioId } from '../actions/rh'
import { TopNav } from '../components/TopNav'
import { MeusDadosForm } from './MeusDadosForm'

export default function MeusDadosPage() {
  const router = useRouter()
  const [usuarioId, setUsuarioId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.replace('/login'); return }
      const id = await getMeuUsuarioId(user.id)
      if (!id) { router.replace('/sistema'); return }
      setUsuarioId(id)
      setLoading(false)
    })
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <TopNav />
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-600 mb-1">
            <a href="/sistema" className="hover:text-gray-700 dark:hover:text-gray-400 transition-colors">Painel</a>
            <span>›</span>
            <span>Meus Dados</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Meus Dados</h1>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            Visualize e atualize suas informações cadastrais, documentos e notas de serviço.
          </p>
        </div>
        <MeusDadosForm usuarioId={usuarioId!} />
      </main>
    </div>
  )
}
