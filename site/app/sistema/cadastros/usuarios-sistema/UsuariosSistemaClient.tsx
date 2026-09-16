'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  getSysUsers,
  createSysUser,
  toggleSysUserAtivo,
  deleteSysUser,
  alterarSenhaSysUser,
  type SysUser,
} from '../../actions/sistema-users'

type FormState = {
  nome: string
  email: string
  senha: string
  is_superadmin: boolean
}

const EMPTY_FORM: FormState = { nome: '', email: '', senha: '', is_superadmin: false }

export function UsuariosSistemaClient() {
  const [users, setUsers] = useState<SysUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [changingPasswordId, setChangingPasswordId] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setUsers(await getSysUsers())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setFormError(null)
    try {
      await createSysUser(form.nome, form.email, form.senha, form.is_superadmin)
      setForm(EMPTY_FORM)
      setShowCreate(false)
      await load()
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Erro ao criar usuário')
    } finally {
      setSaving(false)
    }
  }

  async function handleToggle(user: SysUser) {
    if (user.is_superadmin) return
    try {
      await toggleSysUserAtivo(user.id, !user.ativo)
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, ativo: !user.ativo } : u))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro')
    }
  }

  async function handleDelete(user: SysUser) {
    if (user.is_superadmin) return
    if (!confirm(`Excluir o usuário "${user.nome}"?`)) return
    try {
      await deleteSysUser(user.id)
      setUsers((prev) => prev.filter((u) => u.id !== user.id))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao excluir')
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    if (!changingPasswordId || !newPassword) return
    setSaving(true)
    try {
      await alterarSenhaSysUser(changingPasswordId, newPassword)
      setChangingPasswordId(null)
      setNewPassword('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao alterar senha')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-gray-900 dark:text-white text-2xl font-bold">Usuários do Sistema</h1>
          {!loading && (
            <p className="text-gray-400 dark:text-gray-600 text-sm mt-0.5">
              {users.length} usuário{users.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <button
          onClick={() => { setShowCreate(true); setFormError(null) }}
          className="bg-gold text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#9e2126] transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Novo Usuário
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/30 rounded-xl p-4 mb-6 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Create form */}
      {showCreate && (
        <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl p-6 mb-6">
          <h2 className="text-gray-900 dark:text-white font-semibold mb-5">Novo usuário do sistema</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Nome</label>
                <input
                  required
                  value={form.nome}
                  onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                  className="w-full border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition"
                  placeholder="Nome completo"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">E-mail</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition"
                  placeholder="email@santospress.com.br"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Senha inicial</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={form.senha}
                  onChange={(e) => setForm((f) => ({ ...f, senha: e.target.value }))}
                  className="w-full border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.is_superadmin}
                    onChange={(e) => setForm((f) => ({ ...f, is_superadmin: e.target.checked }))}
                    className="w-4 h-4 accent-gold"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Superadmin</span>
                </label>
              </div>
            </div>

            {formError && (
              <p className="text-red-600 dark:text-red-400 text-sm">{formError}</p>
            )}

            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={saving}
                className="bg-gold text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-[#9e2126] transition-colors disabled:opacity-60"
              >
                {saving ? 'Criando...' : 'Criar usuário'}
              </button>
              <button
                type="button"
                onClick={() => { setShowCreate(false); setForm(EMPTY_FORM) }}
                className="px-5 py-2 rounded-xl text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users table */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/5">
                {['Usuário', 'Tipo', 'Status', ''].map((h) => (
                  <th key={h} className={`text-left text-[10px] text-gray-400 dark:text-gray-600 uppercase tracking-widest font-medium py-3.5 ${h === '' ? 'pr-6' : 'px-6'}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-gray-50 dark:border-white/[0.04] last:border-0">
                  <td className="px-6 py-4">
                    <p className="text-gray-900 dark:text-white text-sm font-medium">{u.nome}</p>
                    <p className="text-gray-400 dark:text-gray-600 text-xs mt-0.5">{u.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                      u.is_superadmin
                        ? 'bg-gold/15 text-gold border-gold/20'
                        : 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-white/5 dark:text-gray-400 dark:border-white/10'
                    }`}>
                      {u.is_superadmin ? 'Superadmin' : 'Admin'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggle(u)}
                      disabled={u.is_superadmin}
                      title={u.is_superadmin ? 'Superadmin sempre ativo' : u.ativo ? 'Ativo' : 'Inativo'}
                      className={`relative inline-flex h-5 w-9 rounded-full transition-colors duration-200 focus:outline-none ${
                        u.ativo ? 'bg-gold' : 'bg-gray-200 dark:bg-white/10'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <span className={`inline-block h-4 w-4 mt-0.5 rounded-full bg-white shadow transition-transform duration-200 ${u.ativo ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </button>
                  </td>
                  <td className="pr-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {changingPasswordId === u.id ? (
                        <form onSubmit={handleChangePassword} className="flex items-center gap-2">
                          <input
                            type="password"
                            required
                            minLength={6}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Nova senha"
                            className="border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold w-32"
                          />
                          <button type="submit" disabled={saving} className="text-xs text-gold hover:text-gold/80 font-medium">
                            {saving ? '...' : 'Salvar'}
                          </button>
                          <button type="button" onClick={() => { setChangingPasswordId(null); setNewPassword('') }} className="text-xs text-gray-400 hover:text-gray-600">
                            ✕
                          </button>
                        </form>
                      ) : (
                        <button
                          onClick={() => { setChangingPasswordId(u.id); setNewPassword('') }}
                          className="text-gray-400 hover:text-gray-700 dark:text-gray-600 dark:hover:text-gray-300 text-xs transition-colors"
                        >
                          Senha
                        </button>
                      )}
                      {!u.is_superadmin && (
                        <button
                          onClick={() => handleDelete(u)}
                          className="text-red-400 hover:text-red-600 text-xs transition-colors"
                        >
                          Excluir
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
