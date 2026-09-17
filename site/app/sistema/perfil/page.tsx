'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getMeuUsuarioId } from '../actions/rh'
import { getMeusRoles } from '../actions/auth'
import { TopNav } from '../components/TopNav'
import { MeusDadosForm } from './MeusDadosForm'

type Modo = 'ver' | 'editar'

export default function MeusDadosPage() {
  const router = useRouter()
  const [usuarioId, setUsuarioId] = useState<string | null>(null)
  const [userRoles, setUserRoles] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [modo, setModo] = useState<Modo>('ver')
  const [isDirty, setIsDirty] = useState(false)
  const [formKey, setFormKey] = useState(0)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('modo') === 'editar') setModo('editar')

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.replace('/login'); return }
      const [id, roles] = await Promise.all([
        getMeuUsuarioId(user.id),
        getMeusRoles(user.id),
      ])
      if (!id) { router.replace('/sistema'); return }
      setUsuarioId(id)
      setUserRoles(roles)
      setLoading(false)
    })
  }, [router])

  function handleHabilitarEdicao() {
    setModo('editar')
    setIsDirty(false)
  }

  function handleSairEdicao() {
    setModo('ver')
    setIsDirty(false)
  }

  function handleCancelar() {
    // Remonta o form para descartar alterações não salvas
    setFormKey(k => k + 1)
    setModo('ver')
    setIsDirty(false)
  }

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

        {/* Cabeçalho */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-600 mb-1">
            <a href="/sistema" className="hover:text-gray-700 dark:hover:text-gray-400 transition-colors">Painel</a>
            <span>›</span>
            <span>Meus Dados</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Meus Dados</h1>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                {modo === 'ver'
                  ? 'Visualizando suas informações. Clique em "Habilitar Edição" para editar.'
                  : 'Modo de edição ativo. Salve as alterações em cada aba.'}
              </p>
            </div>

            {/* Barra de ações */}
            <div className="flex items-center gap-2 shrink-0">
              {modo === 'ver' ? (
                <button
                  onClick={handleHabilitarEdicao}
                  className="flex items-center gap-2 bg-gold text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-gold/90 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                  </svg>
                  Habilitar Edição
                </button>
              ) : isDirty ? (
                <>
                  <button
                    onClick={handleCancelar}
                    className="text-sm font-medium px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSairEdicao}
                    className="flex items-center gap-2 bg-navy dark:bg-white text-white dark:text-navy text-sm font-medium px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Salvo — Sair da Edição
                  </button>
                </>
              ) : (
                <button
                  onClick={handleSairEdicao}
                  className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Sair da Edição
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Indicador de modo */}
        {modo === 'ver' && (
          <div className="flex items-center gap-2 mb-5 text-xs text-gray-400 dark:text-gray-600 bg-gray-50 dark:bg-white/3 border border-gray-100 dark:border-white/5 rounded-xl px-4 py-2.5">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Modo visualização — os campos estão desabilitados
          </div>
        )}
        {modo === 'editar' && isDirty && (
          <div className="flex items-center gap-2 mb-5 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/30 rounded-xl px-4 py-2.5">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            Você tem alterações não salvas — use o botão "Salvar" em cada aba para confirmar
          </div>
        )}

        <MeusDadosForm
          key={formKey}
          usuarioId={usuarioId!}
          readOnly={modo === 'ver'}
          onDirty={() => setIsDirty(true)}
          userRoles={userRoles}
        />
      </main>
    </div>
  )
}
