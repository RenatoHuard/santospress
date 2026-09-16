'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { validarConvite, aceitarConvite } from '@/app/sistema/actions/convites'

type ConviteInfo = {
  nome_sugerido?: string | null
  cargo_sugerido?: string | null
  role: string
}

export default function ConvitePage() {
  const { token } = useParams<{ token: string }>()
  const router = useRouter()

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

  useEffect(() => {
    validarConvite(token).then((res) => {
      if (!res) { setStatus('invalid'); setErro('Convite não encontrado.'); return }
      if ('erro' in res) { setStatus('invalid'); setErro(res.erro ?? null); return }
      setConvite(res)
      setNome(res.nome_sugerido ?? '')
      setStatus('valid')
    })
  }, [token])

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
      if (res.success) {
        setStatus('success')
      } else {
        setSubmitErro(res.erro ?? 'Erro ao criar conta.')
      }
    } catch (err) {
      setSubmitErro(err instanceof Error ? err.message : 'Erro ao criar conta.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-navy rounded-2xl mb-4">
            <span className="text-gold font-bold text-xl">SP</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Santos Press</h1>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Sistema de Gestão</p>
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

          {/* Sucesso */}
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
