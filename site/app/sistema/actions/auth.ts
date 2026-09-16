'use server'

import { createClient } from '@supabase/supabase-js'

function sb() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key || key === 'sua_service_role_key_aqui') throw new Error('SERVICE_KEY_NOT_SET')
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key)
}

export type UserType = 'funcionario' | 'cliente' | 'sistema' | 'unknown'

/**
 * Dado o auth_user_id de um usuário recém-logado, determina se é funcionário,
 * cliente, usuário do sistema (admin) ou desconhecido (sem cadastro SantosPress).
 * Retorna 'unknown' para usuários de outros sistemas no mesmo banco.
 */
export async function checkUserType(authUserId: string): Promise<UserType> {
  const admin = sb()

  const [funcRes, clienteRes, sysRes] = await Promise.all([
    admin.from('spress_usuarios').select('id').eq('auth_user_id', authUserId).maybeSingle(),
    admin.from('spress_clientes').select('id').eq('auth_user_id', authUserId).maybeSingle(),
    admin.from('spress_sys_users').select('id').eq('auth_user_id', authUserId).eq('ativo', true).maybeSingle(),
  ])

  if (funcRes.data) return 'funcionario'
  if (clienteRes.data) return 'cliente'
  if (sysRes.data) return 'sistema'
  return 'unknown'
}

/** Verifica se o auth_user_id pertence a um superadmin do sistema. */
export async function isSuperAdmin(authUserId: string): Promise<boolean> {
  const { data } = await sb()
    .from('spress_sys_users')
    .select('id')
    .eq('auth_user_id', authUserId)
    .eq('is_superadmin', true)
    .eq('ativo', true)
    .maybeSingle()
  return !!data
}

/** Retorna o role do usuário em spress_usuarios (admin, atendente, colaborador…). */
export async function getMeuRole(authUserId: string): Promise<string | null> {
  const { data } = await sb()
    .from('spress_usuarios')
    .select('role')
    .eq('auth_user_id', authUserId)
    .maybeSingle()
  return data?.role ?? null
}

/** Busca dados básicos do cliente pelo auth_user_id (chamado pelo portal). */
export async function getClientePortalData(authUserId: string) {
  const { data } = await sb()
    .from('spress_clientes')
    .select('id, razao_social, nome_fantasia, cnpj, segmento, status, email, telefone, cidade, uf')
    .eq('auth_user_id', authUserId)
    .single()
  return data
}

/** Altera a senha de um cliente no Supabase Auth. */
export async function alterarSenhaCliente(clienteId: string, novaSenha: string) {
  const admin = sb()
  const { data: cliente } = await admin
    .from('spress_clientes')
    .select('auth_user_id')
    .eq('id', clienteId)
    .single()
  if (!cliente?.auth_user_id) throw new Error('Cliente sem acesso configurado.')
  const { error } = await admin.auth.admin.updateUserById(cliente.auth_user_id, {
    password: novaSenha,
  })
  if (error) throw new Error(error.message)
}
