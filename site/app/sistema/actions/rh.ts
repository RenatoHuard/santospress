'use server'

import { createClient } from '@supabase/supabase-js'

function serviceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key || key === 'sua_service_role_key_aqui') throw new Error('SERVICE_KEY_NOT_SET')
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key)
}

function nullify(obj: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, v === '' ? null : v]))
}

// â”€â”€ Dados pessoais â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function getFuncPessoal(usuarioId: string) {
  const { data } = await serviceClient()
    .from('spress_func_pessoal')
    .select('*')
    .eq('usuario_id', usuarioId)
    .maybeSingle()
  return data
}

export async function saveFuncPessoal(usuarioId: string, payload: Record<string, unknown>) {
  const { error } = await serviceClient()
    .from('spress_func_pessoal')
    .upsert(
      { ...nullify(payload), usuario_id: usuarioId, updated_at: new Date().toISOString() },
      { onConflict: 'usuario_id' }
    )
  if (error) throw new Error(error.message)
}

// â”€â”€ DocumentaÃ§Ã£o â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function getFuncDocumentos(usuarioId: string) {
  const { data } = await serviceClient()
    .from('spress_func_documentos')
    .select('*')
    .eq('usuario_id', usuarioId)
    .maybeSingle()
  return data
}

export async function saveFuncDocumentos(usuarioId: string, payload: Record<string, unknown>) {
  const { error } = await serviceClient()
    .from('spress_func_documentos')
    .upsert(
      { ...nullify(payload), usuario_id: usuarioId, updated_at: new Date().toISOString() },
      { onConflict: 'usuario_id' }
    )
  if (error) throw new Error(error.message)
}

// â”€â”€ Dependentes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function getFuncDependentes(usuarioId: string) {
  const { data } = await serviceClient()
    .from('spress_func_dependentes')
    .select('*')
    .eq('usuario_id', usuarioId)
    .order('created_at')
  return data ?? []
}

export async function addFuncDependente(
  usuarioId: string,
  payload: { nome: string; data_nascimento?: string; cpf?: string; parentesco?: string }
) {
  const { error } = await serviceClient()
    .from('spress_func_dependentes')
    .insert({ ...nullify(payload as unknown as Record<string, unknown>), usuario_id: usuarioId })
  if (error) throw new Error(error.message)
}

export async function removeFuncDependente(id: string) {
  await serviceClient().from('spress_func_dependentes').delete().eq('id', id)
}

// â”€â”€ Contrato â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function getFuncContrato(usuarioId: string) {
  const { data } = await serviceClient()
    .from('spress_func_contrato')
    .select('*')
    .eq('usuario_id', usuarioId)
    .maybeSingle()
  return data
}

export async function saveFuncContrato(usuarioId: string, payload: Record<string, unknown>) {
  const { error } = await serviceClient()
    .from('spress_func_contrato')
    .upsert(
      { ...nullify(payload), usuario_id: usuarioId, updated_at: new Date().toISOString() },
      { onConflict: 'usuario_id' }
    )
  if (error) throw new Error(error.message)
}

export async function uploadFuncFoto(formData: FormData): Promise<string> {
  const file = formData.get('file') as File
  const usuarioId = formData.get('usuarioId') as string
  if (!file || !usuarioId) throw new Error('Dados invÃ¡lidos')

  const sb = serviceClient()
  const path = `${usuarioId}/avatar.jpg`
  const arrayBuffer = await file.arrayBuffer()

  const { error } = await sb.storage
    .from('equipe-fotos')
    .upload(path, arrayBuffer, { upsert: true, contentType: 'image/jpeg' })
  if (error) throw new Error(error.message)

  const { data } = sb.storage.from('equipe-fotos').getPublicUrl(path)
  return `${data.publicUrl}?v=${Date.now()}`
}

export async function getFuncionariosSimples() {
  const { data } = await serviceClient()
    .from('spress_usuarios')
    .select('id, nome')
    .order('nome')
  return data ?? []
}

// â”€â”€ BancÃ¡rio e benefÃ­cios â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function getFuncBancario(usuarioId: string) {
  const { data } = await serviceClient()
    .from('spress_func_bancario')
    .select('*')
    .eq('usuario_id', usuarioId)
    .maybeSingle()
  return data
}

export async function saveFuncBancario(usuarioId: string, payload: Record<string, unknown>) {
  const { error } = await serviceClient()
    .from('spress_func_bancario')
    .upsert(
      { ...nullify(payload), usuario_id: usuarioId, updated_at: new Date().toISOString() },
      { onConflict: 'usuario_id' }
    )
  if (error) throw new Error(error.message)
}

// â”€â”€ SaÃºde â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function getFuncSaude(usuarioId: string) {
  const { data } = await serviceClient()
    .from('spress_func_saude')
    .select('*')
    .eq('usuario_id', usuarioId)
    .maybeSingle()
  return data
}

export async function saveFuncSaude(usuarioId: string, payload: Record<string, unknown>) {
  const { error } = await serviceClient()
    .from('spress_func_saude')
    .upsert(
      { ...nullify(payload), usuario_id: usuarioId, updated_at: new Date().toISOString() },
      { onConflict: 'usuario_id' }
    )
  if (error) throw new Error(error.message)
}

// â”€â”€ OcorrÃªncias â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function getFuncOcorrencias(usuarioId: string) {
  const { data } = await serviceClient()
    .from('spress_func_ocorrencias')
    .select('*')
    .eq('usuario_id', usuarioId)
    .order('data_inicio', { ascending: false })
  return data ?? []
}

export async function addFuncOcorrencia(
  usuarioId: string,
  payload: { tipo: string; data_inicio: string; data_fim?: string; descricao?: string }
) {
  const { error } = await serviceClient()
    .from('spress_func_ocorrencias')
    .insert({ ...nullify(payload as unknown as Record<string, unknown>), usuario_id: usuarioId })
  if (error) throw new Error(error.message)
}

export async function removeFuncOcorrencia(id: string) {
  await serviceClient().from('spress_func_ocorrencias').delete().eq('id', id)
}

// â”€â”€ Upload de documento do colaborador â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function uploadColaboradorDoc(formData: FormData): Promise<string> {
  const file = formData.get('file') as File
  const usuarioId = formData.get('usuarioId') as string
  const tipo = formData.get('tipo') as string
  if (!file || !usuarioId || !tipo) throw new Error('Dados invÃ¡lidos')

  const sb = serviceClient()
  const ext = file.name.split('.').pop() ?? 'pdf'
  const path = `${usuarioId}/${tipo}/${Date.now()}.${ext}`
  const arrayBuffer = await file.arrayBuffer()

  const { error } = await sb.storage
    .from('colaborador-docs')
    .upload(path, arrayBuffer, { upsert: false, contentType: file.type })
  if (error) throw new Error(error.message)

  const { data } = sb.storage.from('colaborador-docs').getPublicUrl(path)
  return data.publicUrl
}

// â”€â”€ Atestados mÃ©dicos â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function getFuncAtestados(usuarioId: string) {
  const { data } = await serviceClient()
    .from('spress_func_atestados')
    .select('*')
    .eq('usuario_id', usuarioId)
    .order('data', { ascending: false })
  return data ?? []
}

export async function addFuncAtestado(
  usuarioId: string,
  payload: { data: string; descricao?: string; arquivo_url?: string }
) {
  const { error } = await serviceClient()
    .from('spress_func_atestados')
    .insert({ ...nullify(payload as unknown as Record<string, unknown>), usuario_id: usuarioId })
  if (error) throw new Error(error.message)
}

export async function removeFuncAtestado(id: string) {
  await serviceClient().from('spress_func_atestados').delete().eq('id', id)
}

// â”€â”€ Notas de serviÃ§o â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function getFuncNotasServico(usuarioId: string) {
  const { data } = await serviceClient()
    .from('spress_func_notas_servico')
    .select('*')
    .eq('usuario_id', usuarioId)
    .order('data', { ascending: false })
  return data ?? []
}

export async function addFuncNotaServico(
  usuarioId: string,
  payload: { data: string; descricao?: string; valor?: number | null; arquivo_url?: string }
) {
  const { error } = await serviceClient()
    .from('spress_func_notas_servico')
    .insert({ ...nullify(payload as unknown as Record<string, unknown>), usuario_id: usuarioId })
  if (error) throw new Error(error.message)
}

export async function removeFuncNotaServico(id: string) {
  await serviceClient().from('spress_func_notas_servico').delete().eq('id', id)
}

// â”€â”€ Role do colaborador atual (para controle de visibilidade) â”€â”€â”€â”€â”€
export async function getColaboradorRole(authUserId: string): Promise<{
  role: string
  acesso_financeiro: boolean
} | null> {
  const { data } = await serviceClient()
    .from('spress_usuarios')
    .select('role, setor_id, spress_setores!setor_id(acesso_financeiro)')
    .eq('auth_user_id', authUserId)
    .maybeSingle()
  if (!data) return null
  const setor = Array.isArray(data.spress_setores)
    ? data.spress_setores[0]
    : data.spress_setores
  return {
    role: data.role,
    acesso_financeiro: setor?.acesso_financeiro ?? false,
  }
}

// â”€â”€ Busca o spress_usuarios.id a partir do auth_user_id â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function getMeuUsuarioId(authUserId: string): Promise<string | null> {
  const { data } = await serviceClient()
    .from('spress_usuarios')
    .select('id')
    .eq('auth_user_id', authUserId)
    .maybeSingle()
  return data?.id ?? null
}

export async function getMeusDadosBasicos(authUserId: string): Promise<{ id: string; nome: string } | null> {
  const { data } = await serviceClient()
    .from('spress_usuarios')
    .select('id, nome')
    .eq('auth_user_id', authUserId)
    .maybeSingle()
  return data ?? null
}
