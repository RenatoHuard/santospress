'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getClientePortalData } from '@/app/sistema/actions/auth'
import { criarDepoimento } from '@/app/sistema/actions/depoimentos'

const INPUT = 'w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/8 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-gold/50 focus:ring-2 focus:ring-gold/15 transition text-gray-900 dark:text-white placeholder:text-gray-400'
const LABEL = 'block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5'

export default function RegistrarDepoimentoPage() {
  const router = useRouter()
  const [clienteId, setClienteId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const [autorNome, setAutorNome] = useState('')
  const [autorCargo, setAutorCargo] = useState('')
  const [texto, setTexto] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState(false)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.replace('/login'); return }
      const data = await getClientePortalData(user.id)
      if (!data) { router.replace('/sistema'); return }
      setClienteId(data.id)
      setLoading(false)
    })
  }, [router])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)
    if (!autorNome.trim()) { setErro('Informe seu nome.'); return }
    if (texto.trim().length < 20) { setErro('O depoimento deve ter pelo menos 20 caracteres.'); return }

    startTransition(async () => {
      try {
        await criarDepoimento(clienteId!, {
          autor_nome: autorNome.trim(),
          autor_cargo: autorCargo.trim(),
          texto: texto.trim(),
        })
        setSucesso(true)
      } catch (err) {
        setErro(err instanceof Error ? err.message : 'Erro ao enviar depoimento.')
      }
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
      <main className="max-w-xl mx-auto px-6 py-10">
        <Link href="/sistema/cliente"
          className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mb-6 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Voltar ao portal
        </Link>

        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Registrar Depoimento</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
          Compartilhe sua experiência com a Santos Press. Seu depoimento passará por uma breve revisão antes de ser publicado.
        </p>

        {sucesso ? (
          <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl p-8 text-center">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-gray-900 dark:text-white font-semibold text-lg mb-2">Depoimento enviado!</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Obrigado. Ele passará por aprovação e logo aparecerá no nosso site.
            </p>
            <Link href="/sistema/cliente"
              className="inline-block bg-gold text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-gold/90 transition-colors">
              Voltar ao portal
            </Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL}>Seu Nome <span className="text-red-400">*</span></label>
                  <input type="text" className={INPUT} placeholder="Nome completo"
                    value={autorNome} onChange={(e) => setAutorNome(e.target.value)} />
                </div>
                <div>
                  <label className={LABEL}>Cargo <span className="normal-case text-gray-400 font-normal">(opcional)</span></label>
                  <input type="text" className={INPUT} placeholder="Diretor, Gerente..."
                    value={autorCargo} onChange={(e) => setAutorCargo(e.target.value)} />
                </div>
              </div>

              <div>
                <label className={LABEL}>Depoimento <span className="text-red-400">*</span></label>
                <textarea
                  className={INPUT + ' resize-none'}
                  rows={6}
                  placeholder="Descreva sua experiência com a Santos Press..."
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                />
                <p className="text-xs text-gray-400 dark:text-gray-600 mt-1 text-right">
                  {texto.length} caracteres
                </p>
              </div>

              {erro && (
                <p className="text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/30 rounded-xl px-3 py-2">
                  {erro}
                </p>
              )}

              <button type="submit" disabled={isPending}
                className="w-full bg-gold text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-gold/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                {isPending && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {isPending ? 'Enviando…' : 'Enviar Depoimento'}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  )
}
