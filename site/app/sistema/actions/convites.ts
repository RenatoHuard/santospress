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

export interface ConviteInput {
  nome_sugerido?: string
  cargo_sugerido?: string
  setor_id?: string
  role: string
  criado_por?: string
}

// Admin cria convite e retorna o token
export async function criarConvite(data: ConviteInput): Promise<string> {
  const sb = serviceClient()
  const { data: row, error } = await sb
    .from('spress_convites')
    .insert({
      nome_sugerido: data.nome_sugerido || null,
      cargo_sugerido: data.cargo_sugerido || null,
      setor_id: data.setor_id || null,
      role: data.role,
      criado_por: data.criado_por ?? null,
    })
    .select('token')
    .single()
  if (error) throw new Error(error.message)
  return row.token as string
}

// Página pública valida o token antes de mostrar o formulário
export async function validarConvite(token: string) {
  const sb = anonClient()
  const { data, error } = await sb
    .from('spress_convites')
    .select('id, nome_sugerido, cargo_sugerido, role, expires_at, usado_em')
    .eq('token', token)
    .single()
  if (error || !data) return null
  if (data.usado_em) return { erro: 'Este convite já foi utilizado.' }
  if (new Date(data.expires_at) < new Date()) return { erro: 'Este convite expirou.' }
  return { id: data.id, nome_sugerido: data.nome_sugerido, cargo_sugerido: data.cargo_sugerido, role: data.role }
}

// Colaborador aceita o convite: cria conta + spress_usuarios pendente
export async function aceitarConvite(
  token: string,
  { nome, email, senha }: { nome: string; email: string; senha: string },
): Promise<{ success: boolean; erro?: string }> {
  try {
    const sb = serviceClient()

    // Busca convite
    const { data: convite, error: ce } = await sb
      .from('spress_convites')
      .select('id, cargo_sugerido, setor_id, role, usado_em, expires_at')
      .eq('token', token)
      .single()
    if (ce || !convite) return { success: false, erro: 'Convite não encontrado.' }
    if (convite.usado_em) return { success: false, erro: 'Este convite já foi utilizado.' }
    if (new Date(convite.expires_at) < new Date()) return { success: false, erro: 'Este convite expirou.' }

    // Verifica se já tem perfil no SantosPress
    const { data: jaExiste } = await sb
      .from('spress_usuarios')
      .select('id')
      .eq('email', email)
      .maybeSingle()
    if (jaExiste) return { success: false, erro: 'Este e-mail já tem uma conta no SantosPress.' }

    // Se o e-mail já existe no Auth (ex: conta em outro sistema),
    // vincula silenciosamente — o token do convite é a autorização.
    // Caso contrário, cria nova conta com a senha informada.
    const { data: authUserIdExistente } = await sb.rpc('get_auth_user_id_by_email', { p_email: email })

    let userId: string
    let isNewUser = false

    if (authUserIdExistente) {
      userId = authUserIdExistente as string
    } else {
      const { data: authData, error: ae } = await sb.auth.admin.createUser({
        email,
        password: senha,
        email_confirm: true,
      })
      if (ae || !authData.user) return { success: false, erro: ae?.message ?? 'Erro ao criar conta.' }
      userId = authData.user.id
      isNewUser = true
    }

    // Vincula ao sistema spress
    const { error: use } = await sb
      .from('user_system')
      .insert({ user_id: userId, sistema: 'spress' })
    if (use) {
      if (isNewUser) await sb.auth.admin.deleteUser(userId)
      return { success: false, erro: 'Erro ao registrar acesso: ' + use.message }
    }

    // Cria spress_usuarios com pendente_aprovacao = true
    const { error: ue } = await sb.from('spress_usuarios').insert({
      auth_user_id: userId,
      nome,
      email,
      cargo: convite.cargo_sugerido ?? null,
      setor_id: convite.setor_id ?? null,
      role: convite.role,
      ativo: false,
      pendente_aprovacao: true,
    })
    if (ue) {
      if (isNewUser) await sb.auth.admin.deleteUser(userId)
      return { success: false, erro: 'Erro ao criar perfil: ' + ue.message }
    }

    // Marca convite como usado
    await sb
      .from('spress_convites')
      .update({ usado_em: new Date().toISOString(), usado_por: userId })
      .eq('token', token)

    return { success: true }
  } catch (err) {
    return { success: false, erro: err instanceof Error ? err.message : 'Erro inesperado ao criar conta.' }
  }
}

// Admin lista colaboradores pendentes de aprovação
export async function getColaboradoresPendentes() {
  const sb = serviceClient()
  const { data } = await sb
    .from('spress_usuarios')
    .select('id, nome, email, cargo, role, created_at, spress_setores(nome)')
    .eq('pendente_aprovacao', true)
    .order('created_at', { ascending: false })
  return data ?? []
}

// Admin aprova colaborador
export async function aprovarColaborador(usuarioId: string) {
  const sb = serviceClient()
  const { error } = await sb
    .from('spress_usuarios')
    .update({ ativo: true, pendente_aprovacao: false })
    .eq('id', usuarioId)
  if (error) throw new Error(error.message)
}

// Admin rejeita colaborador (remove tudo)
export async function rejeitarColaborador(usuarioId: string) {
  const sb = serviceClient()
  await sb.from('spress_usuarios').delete().eq('id', usuarioId)
  await sb.from('user_system').delete().eq('user_id', usuarioId)
  await sb.auth.admin.deleteUser(usuarioId)
}

// Admin lista todos os convites
export async function getConvites() {
  const sb = serviceClient()
  const { data } = await sb
    .from('spress_convites')
    .select('id, token, nome_sugerido, cargo_sugerido, role, usado_em, expires_at, created_at, spress_setores(nome)')
    .order('created_at', { ascending: false })
  return data ?? []
}

// Admin cancela convite
export async function cancelarConvite(id: string) {
  const sb = serviceClient()
  await sb.from('spress_convites').delete().eq('id', id)
}

// Lista setores para o modal de convite
export async function getSetores() {
  const sb = serviceClient()
  const { data } = await sb
    .from('spress_setores')
    .select('id, nome')
    .order('nome')
  return data ?? []
}
