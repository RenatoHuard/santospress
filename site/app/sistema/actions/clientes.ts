'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

function sb() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key || key === 'sua_service_role_key_aqui') throw new Error('SERVICE_KEY_NOT_SET')
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key)
}

// ── Cliente principal ─────────────────────────────────────────────

export async function getClientes() {
  const { data } = await sb()
    .from('spress_clientes')
    .select('id, razao_social, nome_fantasia, cnpj, segmento, status, email, telefone')
    .order('razao_social')
  return data ?? []
}

export async function getCliente(id: string) {
  const { data } = await sb()
    .from('spress_clientes')
    .select('*')
    .eq('id', id)
    .single()
  return data
}

export interface ClientePayload {
  razao_social: string
  nome_fantasia: string
  cnpj: string
  inscricao_estadual: string
  inscricao_municipal: string
  segmento: string
  cep: string
  logradouro: string
  numero: string
  complemento: string
  bairro: string
  cidade: string
  uf: string
  telefone: string
  email: string
  site_url: string
  status: string
  observacoes: string
}

function nullify<T extends Record<string, unknown>>(obj: T) {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, v === '' ? null : v])) as T
}

export async function criarCliente(payload: ClientePayload & { senha: string }): Promise<string> {
  const { senha, ...rest } = payload
  const admin = sb()

  if (!rest.email) throw new Error('E-mail é obrigatório para criar o acesso ao portal.')
  if (senha.length < 8) throw new Error('A senha deve ter no mínimo 8 caracteres.')

  // 1. Cria usuário Auth (sem envio de e-mail de confirmação)
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email: rest.email,
    password: senha,
    email_confirm: true,
  })
  if (authError) throw new Error(authError.message)
  const authUserId = authData.user.id

  // 2. Insere o cliente vinculado ao auth user
  const { data, error } = await admin
    .from('spress_clientes')
    .insert({
      ...nullify(rest as Record<string, unknown>),
      auth_user_id: authUserId,
      updated_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (error) {
    // Rollback: remove o auth user se o insert falhar
    await admin.auth.admin.deleteUser(authUserId)
    throw new Error(error.message)
  }

  return data.id
}

export async function atualizarCliente(id: string, payload: ClientePayload) {
  const { error } = await sb()
    .from('spress_clientes')
    .update({ ...nullify(payload as Record<string, unknown>), updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(`/sistema/cadastros/clientes/${id}`)
}

export async function toggleClienteStatus(id: string, status: string) {
  await sb().from('spress_clientes').update({ status }).eq('id', id)
}

// ── Contatos ──────────────────────────────────────────────────────

export interface ContatoPayload {
  id?: string
  tipo: string
  nome: string
  cargo: string
  cpf: string
  telefone: string
  whatsapp: string
  email: string
  observacoes: string
  ordem: number
}

export async function getClienteContatos(clienteId: string) {
  const { data } = await sb()
    .from('spress_clientes_contatos')
    .select('*')
    .eq('cliente_id', clienteId)
    .order('ordem')
  return data ?? []
}

export async function salvarContato(clienteId: string, payload: ContatoPayload) {
  const row = { ...nullify(payload as Record<string, unknown>), cliente_id: clienteId }
  if (payload.id) {
    const { error } = await sb().from('spress_clientes_contatos').update(row).eq('id', payload.id)
    if (error) throw new Error(error.message)
  } else {
    const { error } = await sb().from('spress_clientes_contatos').insert(row)
    if (error) throw new Error(error.message)
  }
}

export async function deletarContato(id: string) {
  await sb().from('spress_clientes_contatos').delete().eq('id', id)
}

// ── Financeiro ────────────────────────────────────────────────────

export interface FinanceiroPayload {
  email_financeiro: string
  banco: string
  agencia: string
  conta: string
  tipo_conta: string
  pix: string
  observacoes: string
}

export async function getClienteFinanceiro(clienteId: string) {
  const { data } = await sb()
    .from('spress_clientes_financeiro')
    .select('*')
    .eq('cliente_id', clienteId)
    .maybeSingle()
  return data
}

export async function salvarClienteFinanceiro(clienteId: string, payload: FinanceiroPayload) {
  const { error } = await sb()
    .from('spress_clientes_financeiro')
    .upsert({ ...nullify(payload as Record<string, unknown>), cliente_id: clienteId, updated_at: new Date().toISOString() }, { onConflict: 'cliente_id' })
  if (error) throw new Error(error.message)
}

// ── Contratos ─────────────────────────────────────────────────────

export interface ContratoPayload {
  id?: string
  titulo: string
  descricao: string
  valor: string
  data_inicio: string
  data_fim: string
  status: string
  arquivo_url: string
}

export async function getClienteContratos(clienteId: string) {
  const { data } = await sb()
    .from('spress_clientes_contratos')
    .select('*')
    .eq('cliente_id', clienteId)
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function salvarContrato(clienteId: string, payload: ContratoPayload) {
  const row = {
    ...nullify(payload as Record<string, unknown>),
    cliente_id: clienteId,
    valor: payload.valor ? parseFloat(payload.valor) : null,
    updated_at: new Date().toISOString(),
  }
  if (payload.id) {
    const { error } = await sb().from('spress_clientes_contratos').update(row).eq('id', payload.id)
    if (error) throw new Error(error.message)
  } else {
    const { error } = await sb().from('spress_clientes_contratos').insert(row)
    if (error) throw new Error(error.message)
  }
}

export async function deletarContrato(id: string) {
  await sb().from('spress_clientes_contratos').delete().eq('id', id)
}

export async function uploadContratoArquivo(formData: FormData): Promise<string> {
  const file = formData.get('file') as File
  const clienteId = formData.get('clienteId') as string

  const ext = file.name.split('.').pop() ?? 'pdf'
  const path = `${clienteId}/${crypto.randomUUID()}.${ext}`

  const { error } = await sb().storage.from('contratos-clientes').upload(path, file, { contentType: file.type })
  if (error) throw new Error(error.message)

  const { data } = await sb().storage.from('contratos-clientes').createSignedUrl(path, 3600)
  // Armazena o path para gerar signed URLs depois; retorna URL temporária para exibição imediata
  return JSON.stringify({ path, signedUrl: data?.signedUrl ?? '' })
}

export async function getContratoSignedUrl(path: string): Promise<string> {
  const { data } = await sb().storage.from('contratos-clientes').createSignedUrl(path, 3600)
  return data?.signedUrl ?? ''
}

// ── CRM ───────────────────────────────────────────────────────────

export interface CRMPayload {
  tipo: string
  titulo: string
  descricao: string
  data: string
  responsavel_id: string
}

export async function getClienteCRM(clienteId: string) {
  const { data } = await sb()
    .from('spress_clientes_crm')
    .select('*, responsavel:spress_usuarios(nome)')
    .eq('cliente_id', clienteId)
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function addCRMEntry(clienteId: string, payload: CRMPayload) {
  const { error } = await sb().from('spress_clientes_crm').insert({
    ...nullify(payload as Record<string, unknown>),
    cliente_id: clienteId,
  })
  if (error) throw new Error(error.message)
}
