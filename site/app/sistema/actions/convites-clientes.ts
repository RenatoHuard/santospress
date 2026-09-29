'use server'

import { createClient } from '@supabase/supabase-js'

function serviceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key || key === 'sua_service_role_key_aqui') throw new Error('SERVICE_KEY_NOT_SET')
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key)
}

export async function criarConviteCliente(empresa_sugerida?: string): Promise<string> {
  const sb = serviceClient()
  const { data, error } = await sb
    .from('spress_convites_clientes')
    .insert({ empresa_sugerida: empresa_sugerida || null })
    .select('token')
    .single()
  if (error) throw new Error(error.message)
  return data.token as string
}

export async function validarConviteCliente(token: string) {
  const sb = serviceClient()
  const { data, error } = await sb
    .from('spress_convites_clientes')
    .select('id, empresa_sugerida, expires_at, usado_em')
    .eq('token', token)
    .single()
  if (error || !data) return null
  if (data.usado_em) return { erro: 'Este convite já foi utilizado.' }
  if (new Date(data.expires_at) < new Date()) return { erro: 'Este convite expirou.' }
  return { id: data.id, empresa_sugerida: data.empresa_sugerida as string | null }
}

export async function aceitarConviteCliente(
  token: string,
  payload: {
    razao_social: string
    nome_fantasia: string
    cnpj: string
    email: string
    telefone: string
    senha: string
  },
): Promise<{ success: boolean; erro?: string }> {
  try {
    const sb = serviceClient()

    const { data: convite, error: ce } = await sb
      .from('spress_convites_clientes')
      .select('id, usado_em, expires_at')
      .eq('token', token)
      .single()
    if (ce || !convite) return { success: false, erro: 'Convite não encontrado.' }
    if (convite.usado_em) return { success: false, erro: 'Este convite já foi utilizado.' }
    if (new Date(convite.expires_at) < new Date()) return { success: false, erro: 'Este convite expirou.' }

    const { data: jaExiste } = await sb
      .from('spress_clientes')
      .select('id')
      .eq('email', payload.email)
      .maybeSingle()
    if (jaExiste) return { success: false, erro: 'Este e-mail já está cadastrado.' }

    const { data: authData, error: ae } = await sb.auth.admin.createUser({
      email: payload.email,
      password: payload.senha,
      email_confirm: true,
    })
    if (ae || !authData.user) return { success: false, erro: ae?.message ?? 'Erro ao criar conta.' }
    const userId = authData.user.id

    const { error: ie } = await sb.from('spress_clientes').insert({
      razao_social: payload.razao_social,
      nome_fantasia: payload.nome_fantasia || null,
      cnpj: payload.cnpj || null,
      email: payload.email,
      telefone: payload.telefone || null,
      status: 'ativo',
      auth_user_id: userId,
      updated_at: new Date().toISOString(),
    })
    if (ie) {
      await sb.auth.admin.deleteUser(userId)
      return { success: false, erro: 'Erro ao criar cadastro: ' + ie.message }
    }

    await sb
      .from('spress_convites_clientes')
      .update({ usado_em: new Date().toISOString(), usado_por: userId })
      .eq('token', token)

    return { success: true }
  } catch (err) {
    return { success: false, erro: err instanceof Error ? err.message : 'Erro inesperado.' }
  }
}

export async function aceitarConviteClienteGoogle(
  token: string,
  payload: {
    razao_social: string
    nome_fantasia: string
    cnpj: string
    email: string
    telefone: string
  },
): Promise<{ success: boolean; erro?: string }> {
  try {
    const sb = serviceClient()

    const { data: convite, error: ce } = await sb
      .from('spress_convites_clientes')
      .select('id, usado_em, expires_at')
      .eq('token', token)
      .single()
    if (ce || !convite) return { success: false, erro: 'Convite não encontrado.' }
    if (convite.usado_em) return { success: false, erro: 'Este convite já foi utilizado.' }
    if (new Date(convite.expires_at) < new Date()) return { success: false, erro: 'Este convite expirou.' }

    const { data: jaExiste } = await sb
      .from('spress_clientes')
      .select('id')
      .eq('email', payload.email)
      .maybeSingle()
    if (jaExiste) return { success: false, erro: 'Este e-mail já está cadastrado.' }

    const { data: authUserId } = await sb.rpc('get_auth_user_id_by_email', { p_email: payload.email })
    if (!authUserId) return { success: false, erro: 'Sessão não encontrada. Tente novamente.' }

    const { error: ie } = await sb.from('spress_clientes').insert({
      razao_social: payload.razao_social,
      nome_fantasia: payload.nome_fantasia || null,
      cnpj: payload.cnpj || null,
      email: payload.email,
      telefone: payload.telefone || null,
      status: 'ativo',
      auth_user_id: authUserId as string,
      updated_at: new Date().toISOString(),
    })
    if (ie) return { success: false, erro: 'Erro ao criar cadastro: ' + ie.message }

    await sb
      .from('spress_convites_clientes')
      .update({ usado_em: new Date().toISOString(), usado_por: authUserId as string })
      .eq('token', token)

    return { success: true }
  } catch (err) {
    return { success: false, erro: err instanceof Error ? err.message : 'Erro inesperado.' }
  }
}

export async function getConvitesClientes() {
  const { data } = await serviceClient()
    .from('spress_convites_clientes')
    .select('id, token, empresa_sugerida, expires_at, usado_em, created_at')
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function cancelarConviteCliente(id: string) {
  await serviceClient().from('spress_convites_clientes').delete().eq('id', id)
}
