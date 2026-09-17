'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { validarConvite, aceitarConvite, aceitarConviteGoogle } from '@/app/sistema/actions/convites'

type ConviteInfo = {
  nome_sugerido?: string | null
  cargo_sugerido?: string | null
  roles: string[]
}

function getBrowserClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

export default function ConvitePage() {
  const { token } = useParams<{ token: string }>()
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid' | 'success'>('loading')
  const [erro, setErro] = useState<string | null>(null)
  const [convite, setConvite] = useState<ConviteInfo | null>(null)

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmacao, setConfirmacao] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitErro, setSubmitErro] = useState<string | null>(null)
  const [showSenha, setShowSenha] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const googleCompletedRef = useRef(false)

  // Completa o convite após autenticação Google
  async function handleGoogleComplete(email: string, googleName: string) {
    if (googleCompletedRef.current) return
    googleCompletedRef.current = true
    setGoogleLoading(true)
    setSubmitErro(null)

    const res = await aceitarConviteGoogle(token, { nome: googleName, email })
    setGoogleLoading(false)

    if (res.success) {
      router.push('/sistema/perfil')
    } else {
      googleCompletedRef.current = false
      setSubmitErro(res.erro ?? 'Erro ao vincular conta Google.')
      setStatus('valid')
    }
  }

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    // Valida o token do convite
    validarConvite(token).then((res) => {
      if (!res) { setStatus('invalid'); setErro('Convite não encontrado.'); return }
      if ('erro' in res) { setStatus('invalid'); setErro(res.erro ?? null); return }
      setConvite(res)
      setNome(res.nome_sugerido ?? '')
      setStatus('valid')
    })

    // Detecta retorno do OAuth Google
    const pendingToken = sessionStorage.getItem('google_convite_token')
    if (pendingToken !== token) return

    setGoogleLoading(true)
    const sb = getBrowserClient()
    let subscriptionRef: { unsubscribe: () => void } | null = null

    function tryComplete(session: { user: { email?: string | null; user_metadata: Record<string, string> } } | null) {
      if (!session?.user?.email) return
      const googleName = session.user.user_metadata?.full_name ?? session.user.user_metadata?.name ?? ''
      handleGoogleComplete(session.user.email, googleName)
    }

    // Tenta imediatamente (caso a sessão já esteja disponível)
    sb.auth.getSession().then(({ data: { session } }) => tryComplete(session))

    // Escuta também via onAuthStateChange (para PKCE flow onde o exchange é assíncrono)
    const { data: { subscription } } = sb.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        sessionStorage.removeItem('google_convite_token')
        tryComplete(session)
      }
    })
    subscriptionRef = subscription

    return () => subscriptionRef?.unsubscribe()
  }, [token]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleGoogleSignIn() {
    sessionStorage.setItem('google_convite_token', token)
    const sb = getBrowserClient()
    await sb.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/convite/${token}`,
      },
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitErro(null)
    if (!nome.trim()) { setSubmitErro('Informe seu nome completo.'); return }
    if (!email.trim()) { setSubmitErro('Informe seu e-mail.'); return }
    if (senha.length < 8) { setSubmitErro('A senha deve ter pelo menos 8 caracteres.'); return }
    if (senha !== confirmacao) { setSubmitErro('As senhas não coincidem.'); return }

    setSubmitting(true)
    try {
      const res = await aceitarConvite(token, { nome: nome.trim(), email: email.trim(), senha })
      if (!res.success) {
        setSubmitErro(res.erro ?? 'Erro ao criar conta.')
        return
      }
      // Faz login automaticamente e redireciona para o perfil
      const sb = getBrowserClient()
      const { error: signInErr } = await sb.auth.signInWithPassword({ email: email.trim(), password: senha })
      if (signInErr) {
        setStatus('success') // Conta criada mas login manual necessário
      } else {
        router.push('/sistema/perfil')
      }
    } catch (err) {
      setSubmitErro(err instanceof Error ? err.message : 'Erro ao criar conta.')
    } finally {
      setSubmitting(false)
    }
  }

  // Tela de processamento Google
  if (googleLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Vinculando sua conta Google…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Image
            src={mounted && resolvedTheme === 'dark'
              ? '/images/Logo_santospress_horizontal_negativo.png'
              : '/images/Logo_santospress_horizontal.png'}
            alt="Santos Press"
            width={200}
            height={60}
            className="h-10 w-auto mx-auto"
          />
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-3">Sistema de Gestão</p>
        </div>

        <div className="bg-white dark:bg-[#111] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm p-8">

          {/* Loading */}
          {status === 'loading' && (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Inválido / expirado */}
          {status === 'invalid' && (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-950/40 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-gray-900 dark:text-white font-semibold mb-2">Convite inválido</h2>
              <p className="text-sm text-gray-500 dark:text-gray-500">{erro}</p>
              <p className="text-xs text-gray-400 dark:text-gray-600 mt-4">Entre em contato com o administrador para solicitar um novo link.</p>
            </div>
          )}

          {/* Sucesso (fallback quando o login automático falha) */}
          {status === 'success' && (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/40 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-gray-900 dark:text-white font-semibold text-lg mb-2">Conta criada!</h2>
              <p className="text-sm text-gray-500 dark:text-gray-500 leading-relaxed">
                Seu cadastro foi recebido e está aguardando aprovação do administrador.<br />
                Você receberá acesso em breve.
              </p>
            </div>
          )}

          {/* Formulário */}
          {status === 'valid' && convite && (
            <>
              <div className="mb-6">
                <h2 className="text-gray-900 dark:text-white font-semibold text-lg">Criar sua conta</h2>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                  Você foi convidado{convite.cargo_sugerido ? ` como ${convite.cargo_sugerido}` : ''} para acessar o sistema da Santos Press.
                </p>
              </div>

              {/* Botão Google */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Entrar com Google
              </button>

              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100 dark:border-white/8" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white dark:bg-[#111] px-3 text-xs text-gray-400 dark:text-gray-600">ou crie com e-mail</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                    Nome completo
                  </label>
                  <input
                    type="text"
                    className="w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/8 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-gold/50 focus:ring-2 focus:ring-gold/15 transition text-gray-900 dark:text-white"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Seu nome completo"
                    autoComplete="name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                    E-mail
                  </label>
                  <input
                    type="email"
                    className="w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/8 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-gold/50 focus:ring-2 focus:ring-gold/15 transition text-gray-900 dark:text-white"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                    Senha
                  </label>
                  <div className="relative">
                    <input
                      type={showSenha ? 'text' : 'password'}
                      className="w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/8 rounded-xl px-3 py-2.5 pr-10 text-sm outline-none focus:border-gold/50 focus:ring-2 focus:ring-gold/15 transition text-gray-900 dark:text-white"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      autoComplete="new-password"
                    />
                    <button type="button" onClick={() => setShowSenha((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        {showSenha
                          ? <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                          : <><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></>
                        }
                      </svg>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                    Confirmar senha
                  </label>
                  <input
                    type={showSenha ? 'text' : 'password'}
                    className="w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/8 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-gold/50 focus:ring-2 focus:ring-gold/15 transition text-gray-900 dark:text-white"
                    value={confirmacao}
                    onChange={(e) => setConfirmacao(e.target.value)}
                    placeholder="Repita a senha"
                    autoComplete="new-password"
                  />
                </div>

                {submitErro && (
                  <p className="text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/30 rounded-xl px-3 py-2">
                    {submitErro}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gold text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-gold/90 disabled:opacity-50 transition-colors mt-2 flex items-center justify-center gap-2"
                >
                  {submitting && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  {submitting ? 'Criando conta…' : 'Criar conta'}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-6">
          Santos Press © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
