'use server'

import { createClient } from '@supabase/supabase-js'

function serviceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key || key === 'sua_service_role_key_aqui') throw new Error('SERVICE_KEY_NOT_SET')
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key)
}

// ── Convite de novo cliente ───────────────────────────────────────────

export async function criarConviteCliente(
  empresa_sugerida?: string,
  nome_contato?: string,
  cargo_contato?: string,
): Promise<string> {
  const sb = serviceClient()
  const { data, error } = await sb
    .from('spress_convites_clientes')
    .insert({
      empresa_sugerida: empresa_sugerida || null,
      nome_contato: nome_contato || null,
      cargo_contato: cargo_contato || null,
    })
    .select('token')
    .single()
  if (error) throw new Error(error.message)
  return data.token as string
}

// ── Convite de acesso para contato existente ─────────────────────────

export async function criarConviteContato(
  clienteId: string,
  contatoId: string,
): Promise<string> {
  const sb = serviceClient()
  const { data, error } = await sb
    .from('spress_convites_clientes')
    .insert({ cliente_id_existente: clienteId, contato_id: contatoId })
    .select('token')
    .single()
  if (error) throw new Error(error.message)
  return data.token as string
}

// ── Validação ─────────────────────────────────────────────────────────

export type ConviteInfo =
  | { tipo: 'novo'; empresa_sugerida: string | null; nome_contato: string | null; cargo_contato: string | null }
  | { tipo: 'contato'; cliente_nome: string; contato_nome: string | null; contato_email: string | null }

export async function validarConviteCliente(token: string): Promise<ConviteInfo | { erro: string } | null> {
  const sb = serviceClient()
  const { data, error } = await sb
    .from('spress_convites_clientes')
    .select('id, empresa_sugerida, nome_contato, cargo_contato, expires_at, usado_em, cliente_id_existente, contato_id')
    .eq('token', token)
    .single()
  if (error || !data) return null
  if (data.usado_em) return { erro: 'Este convite já foi utilizado.' }
  if (new Date(data.expires_at) < new Date()) return { erro: 'Este convite expirou.' }

  if (data.cliente_id_existente) {
    const { data: cliente } = await sb
      .from('spress_clientes')
      .select('razao_social, nome_fantasia')
      .eq('id', data.cliente_id_existente)
      .single()
    let contatoNome: string | null = null
    let contatoEmail: string | null = null
    if (data.contato_id) {
      const { data: contato } = await sb
        .from('spress_clientes_contatos')
        .select('nome, email')
        .eq('id', data.contato_id)
        .single()
      contatoNome = contato?.nome ?? null
      contatoEmail = contato?.email ?? null
    }
    return {
      tipo: 'contato',
      cliente_nome: cliente?.nome_fantasia ?? cliente?.razao_social ?? 'Empresa',
      contato_nome: contatoNome,
      contato_email: contatoEmail,
    }
  }

  return {
    tipo: 'novo',
    empresa_sugerida: data.empresa_sugerida as string | null,
    nome_contato: data.nome_contato as string | null,
    cargo_contato: data.cargo_contato as string | null,
  }
}

// ── Aceitar convite — novo cliente ────────────────────────────────────

export async function aceitarConviteCliente(
  token: string,
  payload: {
    razao_social: string
    nome_fantasia: string
    cnpj: string
    email: string
    telefone: string
    senha: string
    nome_contato?: string
    cargo_contato?: string
  },
): Promise<{ success: boolean; erro?: string }> {
  try {
    const sb = serviceClient()

    const { data: convite, error: ce } = await sb
      .from('spress_convites_clientes')
      .select('id, usado_em, expires_at, nome_contato, cargo_contato')
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

    const { data: clienteData, error: ie } = await sb.from('spress_clientes').insert({
      razao_social: payload.razao_social,
      nome_fantasia: payload.nome_fantasia || null,
      cnpj: payload.cnpj || null,
      email: payload.email,
      telefone: payload.telefone || null,
      status: 'ativo',
      auth_user_id: userId,
      updated_at: new Date().toISOString(),
    }).select('id').single()

    if (ie || !clienteData) {
      await sb.auth.admin.deleteUser(userId)
      return { success: false, erro: 'Erro ao criar cadastro: ' + (ie?.message ?? '') }
    }

    // Registra o responsável como primeiro contato
    const nomeContato = payload.nome_contato || convite.nome_contato || payload.email.split('@')[0]
    await sb.from('spress_clientes_contatos').insert({
      cliente_id: clienteData.id,
      auth_user_id: userId,
      nome: nomeContato,
      cargo: payload.cargo_contato || convite.cargo_contato || null,
      email: payload.email,
      tipo: 'responsavel_legal',
      ordem: 0,
    })

    await sb
      .from('spress_convites_clientes')
      .update({ usado_em: new Date().toISOString(), usado_por: userId })
      .eq('token', token)

    return { success: true }
  } catch (err) {
    return { success: false, erro: err instanceof Error ? err.message : 'Erro inesperado.' }
  }
}

// ── Aceitar convite — contato existente (acesso secundário) ───────────

export async function aceitarConviteContato(
  token: string,
  payload: { email: string; senha: string },
): Promise<{ success: boolean; erro?: string }> {
  try {
    const sb = serviceClient()

    const { data: convite, error: ce } = await sb
      .from('spress_convites_clientes')
      .select('id, usado_em, expires_at, cliente_id_existente, contato_id')
      .eq('token', token)
      .single()
    if (ce || !convite) return { success: false, erro: 'Convite não encontrado.' }
    if (convite.usado_em) return { success: false, erro: 'Este convite já foi utilizado.' }
    if (new Date(convite.expires_at) < new Date()) return { success: false, erro: 'Este convite expirou.' }
    if (!convite.cliente_id_existente) return { success: false, erro: 'Convite inválido.' }

    const { data: authData, error: ae } = await sb.auth.admin.createUser({
      email: payload.email,
      password: payload.senha,
      email_confirm: true,
    })
    if (ae || !authData.user) return { success: false, erro: ae?.message ?? 'Erro ao criar conta.' }
    const userId = authData.user.id

    if (convite.contato_id) {
      await sb.from('spress_clientes_contatos').update({ auth_user_id: userId }).eq('id', convite.contato_id)
    } else {
      await sb.from('spress_clientes_contatos').insert({
        cliente_id: convite.cliente_id_existente,
        auth_user_id: userId,
        nome: payload.email.split('@')[0],
        email: payload.email,
        tipo: 'interlocutor',
        ordem: 99,
      })
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

// ── Aceitar convite Google — novo cliente ─────────────────────────────

export async function aceitarConviteClienteGoogle(
  token: string,
  payload: {
    razao_social: string
    nome_fantasia: string
    cnpj: string
    email: string
    telefone: string
    nome_contato?: string
    cargo_contato?: string
  },
): Promise<{ success: boolean; erro?: string }> {
  try {
    const sb = serviceClient()

    const { data: convite, error: ce } = await sb
      .from('spress_convites_clientes')
      .select('id, usado_em, expires_at, nome_contato, cargo_contato')
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

    const { data: clienteData, error: ie } = await sb.from('spress_clientes').insert({
      razao_social: payload.razao_social,
      nome_fantasia: payload.nome_fantasia || null,
      cnpj: payload.cnpj || null,
      email: payload.email,
      telefone: payload.telefone || null,
      status: 'ativo',
      auth_user_id: authUserId as string,
      updated_at: new Date().toISOString(),
    }).select('id').single()

    if (ie || !clienteData) return { success: false, erro: 'Erro ao criar cadastro: ' + (ie?.message ?? '') }

    const nomeContato = payload.nome_contato || convite.nome_contato || payload.email.split('@')[0]
    await sb.from('spress_clientes_contatos').insert({
      cliente_id: clienteData.id,
      auth_user_id: authUserId as string,
      nome: nomeContato,
      cargo: payload.cargo_contato || convite.cargo_contato || null,
      email: payload.email,
      tipo: 'responsavel_legal',
      ordem: 0,
    })

    await sb
      .from('spress_convites_clientes')
      .update({ usado_em: new Date().toISOString(), usado_por: authUserId as string })
      .eq('token', token)

    return { success: true }
  } catch (err) {
    return { success: false, erro: err instanceof Error ? err.message : 'Erro inesperado.' }
  }
}

// ── Listagem e cancelamento ───────────────────────────────────────────

export async function getConvitesClientes() {
  const { data } = await serviceClient()
    .from('spress_convites_clientes')
    .select('id, token, empresa_sugerida, expires_at, usado_em, created_at, cliente_id_existente')
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function cancelarConviteCliente(id: string) {
  await serviceClient().from('spress_convites_clientes').delete().eq('id', id)
}
