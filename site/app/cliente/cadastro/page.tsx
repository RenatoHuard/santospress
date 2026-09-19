'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getClienteCadastro, salvarClienteCadastro, type ClienteCadastro } from '../actions'

const INPUT =
  'w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/8 text-gray-900 dark:text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-gold/50 focus:ring-2 focus:ring-gold/15 transition placeholder:text-gray-400 dark:placeholder:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed'

const LABEL = 'block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5'

function Field({
  label,
  name,
  value,
  onChange,
  type = 'text',
  placeholder,
  disabled,
}: {
  label: string
  name: keyof ClienteCadastro
  value: string
  onChange: (n: keyof ClienteCadastro, v: string) => void
  type?: string
  placeholder?: string
  disabled?: boolean
}) {
  return (
    <div>
      <label className={LABEL}>{label}</label>
      <input
        type={type}
        className={INPUT}
        value={value}
        onChange={e => onChange(name, e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
      />
    </div>
  )
}

export default function ClienteCadastroPage() {
  const router = useRouter()
  const [authId, setAuthId] = useState<string | null>(null)
  const [dados, setDados] = useState<ClienteCadastro>({
    razao_social: '', nome_fantasia: null, cnpj: null, segmento: null,
    telefone: null, email: null, cidade: null, uf: null, site_url: null,
    cep: null, logradouro: null, numero: null, complemento: null, bairro: null,
  })
  const [loading, setLoading] = useState(true)
  const [sucesso, setSucesso] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.replace('/login'); return }
      setAuthId(user.id)
      const d = await getClienteCadastro(user.id)
      if (d) setDados(d)
      setLoading(false)
    })
  }, [router])

  function set(name: keyof ClienteCadastro, value: string) {
    setDados(prev => ({ ...prev, [name]: value || null }))
    setSucesso(false)
    setErro(null)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!authId) return
    startTransition(async () => {
      const res = await salvarClienteCadastro(authId, dados)
      if (res.sucesso) { setSucesso(true); setErro(null) }
      else setErro(res.erro ?? 'Erro ao salvar.')
    })
  }

  const v = (k: keyof ClienteCadastro) => dados[k] ?? ''

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-7 h-7 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Meu Cadastro</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Mantenha seus dados sempre atualizados para um atendimento mais ágil.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Empresa */}
        <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl p-6 space-y-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Empresa</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Field label="Razão Social" name="razao_social" value={v('razao_social') as string} onChange={set} />
            </div>
            <Field label="Nome Fantasia" name="nome_fantasia" value={v('nome_fantasia') as string} onChange={set} />
            <Field label="CNPJ" name="cnpj" value={v('cnpj') as string} onChange={set} placeholder="00.000.000/0000-00" />
            <Field label="Segmento" name="segmento" value={v('segmento') as string} onChange={set} placeholder="Ex: Saúde, Varejo…" />
            <Field label="Site" name="site_url" value={v('site_url') as string} onChange={set} type="url" placeholder="https://…" />
          </div>
        </div>

        {/* Contato */}
        <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl p-6 space-y-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Contato</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="E-mail" name="email" value={v('email') as string} onChange={set} type="email" />
            <Field label="Telefone" name="telefone" value={v('telefone') as string} onChange={set} placeholder="(13) 99999-9999" />
          </div>
        </div>

        {/* Endereço */}
        <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl p-6 space-y-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Endereço</p>
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="CEP" name="cep" value={v('cep') as string} onChange={set} placeholder="00000-000" />
            <div className="sm:col-span-2">
              <Field label="Logradouro" name="logradouro" value={v('logradouro') as string} onChange={set} />
            </div>
            <Field label="Número" name="numero" value={v('numero') as string} onChange={set} />
            <div className="sm:col-span-2">
              <Field label="Complemento" name="complemento" value={v('complemento') as string} onChange={set} />
            </div>
            <Field label="Bairro" name="bairro" value={v('bairro') as string} onChange={set} />
            <Field label="Cidade" name="cidade" value={v('cidade') as string} onChange={set} />
            <Field label="UF" name="uf" value={v('uf') as string} onChange={set} placeholder="SP" />
          </div>
        </div>

        {sucesso && (
          <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30 rounded-xl px-4 py-3">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Dados salvos com sucesso!
          </div>
        )}

        {erro && (
          <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/30 rounded-xl px-4 py-3">
            {erro}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full sm:w-auto px-8 py-3 bg-gold hover:bg-gold/90 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors"
        >
          {isPending ? 'Salvando…' : 'Salvar alterações'}
        </button>
      </form>
    </div>
  )
}
