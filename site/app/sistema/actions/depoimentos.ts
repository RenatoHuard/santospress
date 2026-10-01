'use server'

import { createClient } from '@supabase/supabase-js'

function sb() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key || key === 'sua_service_role_key_aqui') throw new Error('SERVICE_KEY_NOT_SET')
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key)
}

export interface DepoimentoPayload {
  autor_nome: string
  autor_cargo: string
  texto: string
  foto_url?: string
}

export type Depoimento = {
  id: string
  cliente_id: string
  autor_nome: string
  autor_cargo: string | null
  texto: string
  foto_url: string | null
  ativo: boolean
  novo: boolean
  criado_em: string
}

export type DepoimentoNovo = {
  id: string
  autor_nome: string
  criado_em: string
  cliente: { id: string; razao_social: string; nome_fantasia: string | null } | null
}

export type DepoimentoPublico = Depoimento & {
  cliente: { razao_social: string; nome_fantasia: string | null; logo_url: string | null } | null
}

export async function criarDepoimento(clienteId: string, payload: DepoimentoPayload) {
  const { error } = await sb()
    .from('spress_depoimentos')
    .insert({
      cliente_id: clienteId,
      autor_nome: payload.autor_nome,
      autor_cargo: payload.autor_cargo || null,
      texto: payload.texto,
      foto_url: payload.foto_url || null,
      ativo: false,
    })
  if (error) throw new Error(error.message)
}

export async function getDepoimentosCliente(clienteId: string): Promise<Depoimento[]> {
  const { data } = await sb()
    .from('spress_depoimentos')
    .select('*')
    .eq('cliente_id', clienteId)
    .order('criado_em', { ascending: false })
  return (data ?? []) as Depoimento[]
}

export async function toggleDepoimento(id: string, ativo: boolean) {
  const { error } = await sb()
    .from('spress_depoimentos')
    .update({ ativo, novo: false })
    .eq('id', id)
  if (error) throw new Error(error.message)
}

export async function marcarDepoimentosComoVistos(clienteId: string) {
  await sb()
    .from('spress_depoimentos')
    .update({ novo: false })
    .eq('cliente_id', clienteId)
    .eq('novo', true)
}

export async function getDepoimentosNovos(): Promise<DepoimentoNovo[]> {
  const { data } = await sb()
    .from('spress_depoimentos')
    .select('id, autor_nome, criado_em, cliente:spress_clientes(id, razao_social, nome_fantasia)')
    .eq('novo', true)
    .order('criado_em', { ascending: false })
  return (data ?? []) as unknown as DepoimentoNovo[]
}

export async function getDepoimentosPublicos(): Promise<DepoimentoPublico[]> {
  const { data } = await sb()
    .from('spress_depoimentos')
    .select('*, cliente:spress_clientes(razao_social, nome_fantasia, logo_url)')
    .eq('ativo', true)
    .order('criado_em', { ascending: false })
  return (data ?? []) as DepoimentoPublico[]
}
