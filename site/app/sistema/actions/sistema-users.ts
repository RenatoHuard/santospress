'use server'

import { createClient } from '@supabase/supabase-js'

function sb() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key || key === 'sua_service_role_key_aqui') throw new Error('SERVICE_KEY_NOT_SET')
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key)
}

export type SysUser = {
  id: string
  nome: string
  email: string
  is_superadmin: boolean
  ativo: boolean
  created_at: string
}

export async function getSysUsers(): Promise<SysUser[]> {
  const { data, error } = await sb()
    .from('spress_sys_users')
    .select('id, nome, email, is_superadmin, ativo, created_at')
    .order('created_at')
  if (error) throw new Error(error.message)
  return (data ?? []) as SysUser[]
}

export async function createSysUser(
  nome: string,
  email: string,
  senha: string,
  is_superadmin: boolean,
) {
  const admin = sb()

  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
  })
  if (authError) throw new Error(authError.message)

  const auth_user_id = authData.user.id

  const { error } = await admin
    .from('spress_sys_users')
    .insert({ auth_user_id, nome, email, is_superadmin, ativo: true })

  if (error) {
    await admin.auth.admin.deleteUser(auth_user_id)
    throw new Error(error.message)
  }
}

export async function alterarSenhaSysUser(id: string, novaSenha: string) {
  const admin = sb()
  const { data } = await admin
    .from('spress_sys_users')
    .select('auth_user_id')
    .eq('id', id)
    .single()
  if (!data?.auth_user_id) throw new Error('Usuário não encontrado')

  const { error } = await admin.auth.admin.updateUserById(data.auth_user_id, {
    password: novaSenha,
  })
  if (error) throw new Error(error.message)
}

export async function toggleSysUserAtivo(id: string, ativo: boolean) {
  const { error } = await sb()
    .from('spress_sys_users')
    .update({ ativo })
    .eq('id', id)
    .eq('is_superadmin', false)
  if (error) throw new Error(error.message)
}

export async function deleteSysUser(id: string) {
  const admin = sb()

  const { data } = await admin
    .from('spress_sys_users')
    .select('auth_user_id, is_superadmin')
    .eq('id', id)
    .single()
  if (!data) throw new Error('Usuário não encontrado')
  if (data.is_superadmin) throw new Error('Não é possível excluir o superadmin')

  await admin.from('spress_sys_users').delete().eq('id', id)
  await admin.auth.admin.deleteUser(data.auth_user_id)
}
