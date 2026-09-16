'use server'

import { createClient } from '@supabase/supabase-js'

function serviceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key || key === 'sua_service_role_key_aqui') throw new Error('SERVICE_KEY_NOT_SET')
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key)
}

function anonClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

export async function getDashboardStats() {
  try {
    const sb = serviceClient()
    const [f, c] = await Promise.allSettled([
      sb.from('spress_usuarios').select('*', { count: 'exact', head: true }).eq('ativo', true),
      sb.from('spress_clientes').select('*', { count: 'exact', head: true }).eq('status', 'ativo'),
    ])
    return {
      funcionariosAtivos: f.status === 'fulfilled' ? (f.value.count ?? 0) : 0,
      clientesAtivos: c.status === 'fulfilled' ? (c.value.count ?? 0) : 0,
      configured: true,
    }
  } catch {
    return { funcionariosAtivos: 0, clientesAtivos: 0, configured: false }
  }
}

export async function getSetores() {
  const sb = serviceClient()
  const { data } = await sb.from('spress_setores').select('id, nome').order('nome')
  return data ?? []
}

export async function getFuncionarios() {
  const sb = serviceClient()
  const { data } = await sb
    .from('spress_usuarios')
    .select('id, nome, email, cargo, role, ativo, foto_url, setor_id, spress_setores(nome)')
    .order('nome')
  return data ?? []
}

export async function getFuncionario(id: string) {
  const sb = serviceClient()
  const { data } = await sb
    .from('spress_usuarios')
    .select('id, nome, nome_site, email, cargo, role, ativo, foto_url, setor_id, descricao_site')
    .eq('id', id)
    .single()
  return data
}

export async function criarFuncionario(payload: {
  nome: string
  nome_site: string
  email: string
  senha: string
  cargo: string
  setor_id: string
  role: string
  ativo: boolean
  foto_url: string
  descricao_site: string
}): Promise<string> {
  const sb = serviceClient()

  // Cria o usuário Auth com senha definida e e-mail já confirmado
  const { data: authData, error: authError } = await sb.auth.admin.createUser({
    email: payload.email,
    password: payload.senha,
    email_confirm: true,
  })
  if (authError) throw new Error(authError.message)
  const userId = authData.user.id

  await sb.from('user_system').insert({ user_id: userId, sistema: 'spress' })

  const { data: func, error: funcError } = await sb
    .from('spress_usuarios')
    .insert({
      auth_user_id: userId,
      nome: payload.nome,
      nome_site: payload.nome_site || null,
      email: payload.email,
      cargo: payload.cargo || null,
      setor_id: payload.setor_id || null,
      role: payload.role,
      ativo: payload.ativo,
      foto_url: payload.foto_url || null,
      descricao_site: payload.descricao_site || null,
    })
    .select('id')
    .single()
  if (funcError) throw new Error(funcError.message)

  return func.id
}

export async function atualizarFuncionario(
  id: string,
  payload: {
    nome: string
    nome_site: string
    cargo: string
    setor_id: string
    role: string
    ativo: boolean
    foto_url: string
    descricao_site: string
  }
) {
  const sb = serviceClient()
  const { error } = await sb
    .from('spress_usuarios')
    .update({
      nome: payload.nome,
      nome_site: payload.nome_site || null,
      cargo: payload.cargo || null,
      setor_id: payload.setor_id || null,
      role: payload.role,
      ativo: payload.ativo,
      foto_url: payload.foto_url || null,
      descricao_site: payload.descricao_site || null,
    })
    .eq('id', id)
  if (error) throw new Error(error.message)
}

export async function updateFuncFotoUrl(id: string, url: string) {
  const sb = serviceClient()
  await sb.from('spress_usuarios').update({ foto_url: url || null }).eq('id', id)
}

export async function toggleFuncionarioAtivo(id: string, ativo: boolean) {
  const sb = serviceClient()
  await sb.from('spress_usuarios').update({ ativo }).eq('id', id)
}

// ── Credenciais ───────────────────────────────────────────────────

export async function alterarSenhaFuncionario(
  usuarioId: string,
  novaSenha: string,
  feitoPor: string,
) {
  const sb = serviceClient()

  const { data: func } = await sb
    .from('spress_usuarios')
    .select('auth_user_id, email')
    .eq('id', usuarioId)
    .single()
  if (!func?.auth_user_id) throw new Error('Funcionário não encontrado')

  const { error } = await sb.auth.admin.updateUserById(func.auth_user_id, {
    password: novaSenha,
  })
  if (error) throw new Error(error.message)

  // Registro de auditoria
  await sb.from('spress_audit_credenciais').insert({
    usuario_id: usuarioId,
    tipo: 'senha',
    feito_por: feitoPor,
  })

}

export async function alterarEmailFuncionario(
  usuarioId: string,
  novoEmail: string,
  feitoPor: string,
) {
  const sb = serviceClient()

  const { data: func } = await sb
    .from('spress_usuarios')
    .select('auth_user_id, email')
    .eq('id', usuarioId)
    .single()
  if (!func?.auth_user_id) throw new Error('Funcionário não encontrado')

  const emailAntigo = func.email ?? ''

  // Atualiza Auth (email_confirm: true = sem necessidade de confirmação no novo e-mail)
  const { error } = await sb.auth.admin.updateUserById(func.auth_user_id, {
    email: novoEmail,
    email_confirm: true,
  })
  if (error) throw new Error(error.message)

  // Atualiza registro em spress_usuarios
  await sb.from('spress_usuarios').update({ email: novoEmail }).eq('id', usuarioId)

  // Registro de auditoria
  await sb.from('spress_audit_credenciais').insert({
    usuario_id: usuarioId,
    tipo: 'email',
    feito_por: feitoPor,
    valor_antigo: emailAntigo,
  })
}

export async function getAuditCredenciais(usuarioId: string) {
  const { data } = await serviceClient()
    .from('spress_audit_credenciais')
    .select('id, tipo, feito_por, valor_antigo, created_at')
    .eq('usuario_id', usuarioId)
    .order('created_at', { ascending: false })
    .limit(15)
  return data ?? []
}

export async function excluirColaborador(
  id: string,
  feitoPor: string,
): Promise<{ success: boolean; erro?: string }> {
  try {
    const sb = serviceClient()

    const { data: func } = await sb
      .from('spress_usuarios')
      .select('auth_user_id, nome, email')
      .eq('id', id)
      .single()
    if (!func?.auth_user_id) return { success: false, erro: 'Colaborador não encontrado.' }

    const authUserId = func.auth_user_id

    await sb.from('spress_usuarios').delete().eq('id', id)
    await sb.from('user_system').delete().eq('user_id', authUserId).eq('sistema', 'spress')

    // Remove do Auth apenas se não tiver outros sistemas vinculados
    const { count } = await sb
      .from('user_system')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', authUserId)
    if ((count ?? 0) === 0) {
      await sb.auth.admin.deleteUser(authUserId)
    }

    await sb.from('spress_audit_acoes').insert({
      acao: 'excluir_colaborador',
      descricao: `Colaborador ${func.nome} (${func.email}) excluído`,
      realizado_por: feitoPor,
      dados: { colaborador_id: id, auth_user_id: authUserId, nome: func.nome, email: func.email },
    })

    return { success: true }
  } catch (err) {
    return { success: false, erro: err instanceof Error ? err.message : 'Erro inesperado.' }
  }
}
