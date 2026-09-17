'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  criarFuncionario,
  atualizarFuncionario,
  alterarSenhaFuncionario,
  alterarEmailFuncionario,
  getAuditCredenciais,
} from '../../../../actions'
import { ImageCropUpload } from '../ImageCropUpload'
import { supabase } from '@/lib/supabase'
import { inputCls, Section, Field, G2, Feedback, BoolToggle, MaskedInput } from './_shared'
import { validateEmail } from './_masks'

interface Funcionario {
  id: string
  nome: string
  nome_site: string | null
  email: string | null
  cargo: string | null
  setor_id: string | null
  role: string
  roles: string[]
  ativo: boolean
  foto_url: string | null
  descricao_site: string | null
}

interface AuditEntry {
  id: string
  tipo: 'senha' | 'email'
  feito_por: string | null
  valor_antigo: string | null
  created_at: string
}

interface Props {
  mode: 'create' | 'edit'
  setores: { id: string; nome: string }[]
  initialData?: Funcionario
}

const ALL_ROLES = [
  { value: 'colaborador', label: 'Colaborador',  desc: 'Acesso ao próprio perfil' },
  { value: 'atendente',   label: 'Atendente',    desc: 'Perfil básico, sem dados de RH' },
  { value: 'gestor',      label: 'Gestor',       desc: 'Visualiza perfis da equipe' },
  { value: 'rh',          label: 'RH',           desc: 'Edita salário e benefícios da equipe' },
  { value: 'admin',       label: 'Administrador',desc: 'Acesso total ao sistema' },
]

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function TabAcesso({ mode, setores, initialData }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Identidade do admin logado (para auditoria)
  const [adminEmail, setAdminEmail] = useState('')
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAdminEmail(session?.user?.email ?? 'Sistema')
    })
  }, [])

  const [form, setForm] = useState({
    nome: initialData?.nome ?? '',
    nome_site: initialData?.nome_site ?? '',
    email: initialData?.email ?? '',
    senha: '',
    confirmarSenha: '',
    cargo: initialData?.cargo ?? '',
    setor_id: initialData?.setor_id ?? '',
    roles: (initialData?.roles?.length ? initialData.roles : [initialData?.role ?? 'colaborador']) as string[],
    ativo: initialData?.ativo ?? true,
    foto_url: initialData?.foto_url ?? '',
    descricao_site: initialData?.descricao_site ?? '',
  })

  function toggleRole(value: string) {
    setForm(prev => {
      const has = prev.roles.includes(value)
      const next = has ? prev.roles.filter(r => r !== value) : [...prev.roles, value]
      return { ...prev, roles: next.length > 0 ? next : [value] }
    })
  }

  function set(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  // ── Salvar dados gerais ──────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (mode === 'create' && form.senha !== form.confirmarSenha) {
      setError('As senhas não conferem.')
      return
    }
    if (mode === 'create' && form.senha.length < 8) {
      setError('A senha deve ter no mínimo 8 caracteres.')
      return
    }
    setSaving(true)
    setError(null)
    setSuccess(false)
    try {
      if (mode === 'create') {
        const newId = await criarFuncionario(form)
        router.push(`/sistema/cadastros/funcionarios/${newId}`)
      } else {
        await atualizarFuncionario(initialData!.id, form)
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
        router.refresh()
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(msg === 'SERVICE_KEY_NOT_SET' ? 'Configure SUPABASE_SERVICE_ROLE_KEY no .env.local.' : msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Section title="Dados do Sistema">
          <G2>
            <Field label="Nome completo" full>
              <input
                required
                type="text"
                className={inputCls}
                placeholder="Ex.: Maria Joaquina da Silva"
                value={form.nome}
                onChange={(e) => set('nome', e.target.value)}
              />
            </Field>
            <Field
              label="E-mail"
              note={mode === 'create' ? 'usado para login' : 'para alterar, use a seção Segurança abaixo'}
            >
              {mode === 'create' ? (
                <MaskedInput
                  required
                  type="email"
                  value={form.email}
                  onChange={(v) => set('email', v)}
                  validate={validateEmail}
                  placeholder="funcionario@email.com"
                />
              ) : (
                <div className={`${inputCls} text-gray-400 dark:text-gray-500 cursor-default select-none`}>
                  {form.email || '—'}
                </div>
              )}
            </Field>
            <Field label="Cargo">
              <input
                type="text"
                className={inputCls}
                placeholder="Ex.: Assessora de Imprensa"
                value={form.cargo}
                onChange={(e) => set('cargo', e.target.value)}
              />
            </Field>
          </G2>
        </Section>

        {mode === 'create' && (
          <Section title="Senha de Acesso">
            <p className="text-xs text-gray-400 dark:text-gray-600 -mt-1">
              Defina uma senha inicial. O funcionário poderá alterá-la depois.
            </p>
            <G2>
              <Field label="Senha" note="mínimo 8 caracteres">
                <input
                  required
                  type="password"
                  autoComplete="new-password"
                  className={inputCls}
                  placeholder="••••••••"
                  value={form.senha}
                  onChange={(e) => set('senha', e.target.value)}
                />
              </Field>
              <Field label="Confirmar senha">
                <input
                  required
                  type="password"
                  autoComplete="new-password"
                  className={inputCls}
                  placeholder="••••••••"
                  value={form.confirmarSenha}
                  onChange={(e) => set('confirmarSenha', e.target.value)}
                />
              </Field>
            </G2>
          </Section>
        )}

        <Section title="Acesso ao Sistema">
          <Field label="Setor">
            <select className={inputCls} value={form.setor_id} onChange={(e) => set('setor_id', e.target.value)}>
              <option value="">Sem setor</option>
              {setores.map((s) => (
                <option key={s.id} value={s.id}>{s.nome}</option>
              ))}
            </select>
          </Field>
          <Field label="Permissões" note="selecione uma ou mais">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
              {ALL_ROLES.map((r) => {
                const checked = form.roles.includes(r.value)
                return (
                  <label
                    key={r.value}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      checked
                        ? 'border-gold/60 bg-gold/5 dark:bg-gold/10'
                        : 'border-gray-200 dark:border-white/8 hover:border-gray-300 dark:hover:border-white/15'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleRole(r.value)}
                      className="mt-0.5 accent-gold shrink-0"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white leading-none">{r.label}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{r.desc}</p>
                    </div>
                  </label>
                )
              })}
            </div>
          </Field>
        </Section>

        <Section title="Página Equipe (site público)">
          <BoolToggle
            label="Exibir na página Equipe"
            note="Quando ativo, o membro aparece no site público"
            checked={form.ativo}
            onChange={(v) => set('ativo', v)}
          />
          <Field label="Nome para exibição no site" note="deixe em branco para usar o nome completo">
            <input
              type="text"
              className={inputCls}
              placeholder="Ex.: Maria Silva"
              value={form.nome_site}
              onChange={(e) => set('nome_site', e.target.value)}
            />
          </Field>
          {mode === 'edit' && initialData ? (
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Foto</p>
              <ImageCropUpload
                usuarioId={initialData.id}
                currentUrl={form.foto_url}
                onChange={(url) => set('foto_url', url)}
              />
            </div>
          ) : (
            <Field label="Foto" note="URL da imagem (upload disponível após o cadastro)">
              <input
                type="url"
                className={inputCls}
                placeholder="https://exemplo.com/foto.jpg"
                value={form.foto_url}
                onChange={(e) => set('foto_url', e.target.value)}
              />
            </Field>
          )}
          <Field label="Descrição para o site" note="aparece no card da equipe">
            <textarea
              rows={4}
              className={`${inputCls} resize-none leading-relaxed`}
              placeholder="Breve bio ou área de atuação..."
              value={form.descricao_site}
              onChange={(e) => set('descricao_site', e.target.value)}
            />
          </Field>
        </Section>

        <Feedback error={error} success={success} />

        <div className="flex items-center gap-4 pb-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-gold text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#9e2126] disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {saving && (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            )}
            {mode === 'create'
              ? saving ? 'Cadastrando...' : 'Cadastrar funcionário'
              : saving ? 'Salvando...' : 'Salvar alterações'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>

      {/* Segurança — apenas no modo edição */}
      {mode === 'edit' && initialData && (
        <SegurancaSection
          usuarioId={initialData.id}
          emailAtual={initialData.email ?? ''}
          adminEmail={adminEmail}
        />
      )}
    </div>
  )
}

// ── Seção de segurança separada ────────────────────────────────────

function SegurancaSection({
  usuarioId,
  emailAtual,
  adminEmail,
}: {
  usuarioId: string
  emailAtual: string
  adminEmail: string
}) {
  const router = useRouter()

  const [novoEmail, setNovoEmail] = useState('')
  const [emailSaving, setEmailSaving] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [emailSuccess, setEmailSuccess] = useState(false)

  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [senhaSaving, setSenhaSaving] = useState(false)
  const [senhaError, setSenhaError] = useState<string | null>(null)
  const [senhaSuccess, setSenhaSuccess] = useState(false)

  const [audit, setAudit] = useState<AuditEntry[]>([])
  const [auditLoading, setAuditLoading] = useState(true)

  useEffect(() => {
    getAuditCredenciais(usuarioId).then((data) => {
      setAudit(data as AuditEntry[])
      setAuditLoading(false)
    })
  }, [usuarioId])

  async function handleAlterarEmail(e: React.FormEvent) {
    e.preventDefault()
    if (!novoEmail) return
    setEmailSaving(true)
    setEmailError(null)
    setEmailSuccess(false)
    try {
      await alterarEmailFuncionario(usuarioId, novoEmail, adminEmail)
      setEmailSuccess(true)
      setNovoEmail('')
      // Recarrega o audit
      const data = await getAuditCredenciais(usuarioId)
      setAudit(data as AuditEntry[])
      router.refresh()
      setTimeout(() => setEmailSuccess(false), 4000)
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : 'Erro ao alterar e-mail')
    } finally {
      setEmailSaving(false)
    }
  }

  async function handleAlterarSenha(e: React.FormEvent) {
    e.preventDefault()
    if (novaSenha !== confirmarSenha) {
      setSenhaError('As senhas não conferem.')
      return
    }
    if (novaSenha.length < 8) {
      setSenhaError('A senha deve ter no mínimo 8 caracteres.')
      return
    }
    setSenhaSaving(true)
    setSenhaError(null)
    setSenhaSuccess(false)
    try {
      await alterarSenhaFuncionario(usuarioId, novaSenha, adminEmail)
      setSenhaSuccess(true)
      setNovaSenha('')
      setConfirmarSenha('')
      const data = await getAuditCredenciais(usuarioId)
      setAudit(data as AuditEntry[])
      setTimeout(() => setSenhaSuccess(false), 4000)
    } catch (err) {
      setSenhaError(err instanceof Error ? err.message : 'Erro ao alterar senha')
    } finally {
      setSenhaSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Alterar e-mail */}
      <Section title="Alterar E-mail de Acesso">
        <p className="text-xs text-gray-400 dark:text-gray-600 -mt-1">
          E-mail atual: <span className="text-gray-600 dark:text-gray-400 font-mono">{emailAtual || '—'}</span>
        </p>
        <form onSubmit={handleAlterarEmail} className="space-y-4">
          <Field label="Novo e-mail">
            <MaskedInput
              required
              type="email"
              value={novoEmail}
              onChange={(v) => setNovoEmail(v)}
              validate={validateEmail}
              placeholder="novo@email.com"
            />
          </Field>
          <Feedback error={emailError} success={emailSuccess} />
          {emailSuccess && (
            <p className="text-green-600 dark:text-green-400 text-sm">
              E-mail alterado. O funcionário pode usar o novo endereço para entrar.
            </p>
          )}
          <button
            type="submit"
            disabled={emailSaving || !novoEmail}
            className="bg-gold text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#9e2126] disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {emailSaving && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
            {emailSaving ? 'Alterando...' : 'Alterar e-mail'}
          </button>
        </form>
      </Section>

      {/* Alterar senha */}
      <Section title="Alterar Senha de Acesso">
        <p className="text-xs text-gray-400 dark:text-gray-600 -mt-1">
          O funcionário receberá um e-mail informando a alteração.
        </p>
        <form onSubmit={handleAlterarSenha} className="space-y-4">
          <G2>
            <Field label="Nova senha" note="mínimo 8 caracteres">
              <input
                required
                type="password"
                autoComplete="new-password"
                className={inputCls}
                placeholder="••••••••"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
              />
            </Field>
            <Field label="Confirmar nova senha">
              <input
                required
                type="password"
                autoComplete="new-password"
                className={inputCls}
                placeholder="••••••••"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
              />
            </Field>
          </G2>
          <Feedback error={senhaError} success={senhaSuccess} />
          {senhaSuccess && (
            <p className="text-green-600 dark:text-green-400 text-sm">
              Senha alterada. Um e-mail de notificação foi enviado ao funcionário.
            </p>
          )}
          <button
            type="submit"
            disabled={senhaSaving || !novaSenha}
            className="bg-gold text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#9e2126] disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {senhaSaving && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
            {senhaSaving ? 'Alterando...' : 'Alterar senha'}
          </button>
        </form>
      </Section>

      {/* Histórico de alterações */}
      <Section title="Histórico de Alterações de Credenciais">
        {auditLoading ? (
          <div className="flex justify-center py-6">
            <div className="w-5 h-5 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          </div>
        ) : audit.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-600">Nenhuma alteração registrada.</p>
        ) : (
          <div className="space-y-2">
            {audit.map((entry) => (
              <div
                key={entry.id}
                className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-white/5 last:border-0"
              >
                <span className={`mt-0.5 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  entry.tipo === 'senha'
                    ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
                    : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                }`}>
                  {entry.tipo === 'senha' ? 'Senha' : 'E-mail'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {entry.tipo === 'email'
                      ? `Alterado de ${entry.valor_antigo || '—'}`
                      : 'Senha redefinida'}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">
                    por <span className="font-medium">{entry.feito_por || 'Sistema'}</span>
                    {' · '}{fmtDate(entry.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  )
}
