'use server'

import { createClient } from '@supabase/supabase-js'

function sb() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key || key === 'sua_service_role_key_aqui') throw new Error('SERVICE_KEY_NOT_SET')
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key)
}

export interface Equipe {
  id: string
  nome: string
  descricao: string | null
  is_empresa: boolean
  membros: MembroEquipe[]
}

export interface MembroEquipe {
  id: string
  usuario_id: string
  parent_id: string | null
  cargo_equipe: string | null
  usuario: {
    id: string
    nome: string
    email: string | null
    cargo: string | null
    foto_url: string | null
    roles: string[]
  }
}

export async function getEquipes(): Promise<Equipe[]> {
  const client = sb()
  const { data } = await client
    .from('spress_equipes')
    .select(`
      id, nome, descricao, is_empresa,
      spress_equipe_membros(
        id, usuario_id, parent_id, cargo_equipe,
        spress_usuarios(id, nome, email, cargo, foto_url, roles)
      )
    `)
    .order('is_empresa', { ascending: false })
    .order('nome')
  if (!data) return []
  return data.map((e) => ({
    id: e.id,
    nome: e.nome,
    descricao: e.descricao,
    is_empresa: e.is_empresa,
    membros: ((e.spress_equipe_membros as unknown[]) ?? []).map((m: unknown) => {
      const mb = m as {
        id: string; usuario_id: string; parent_id: string | null; cargo_equipe: string | null
        spress_usuarios: { id: string; nome: string; email: string | null; cargo: string | null; foto_url: string | null; roles: string[] }
      }
      return {
        id: mb.id,
        usuario_id: mb.usuario_id,
        parent_id: mb.parent_id,
        cargo_equipe: mb.cargo_equipe,
        usuario: mb.spress_usuarios,
      }
    }),
  }))
}

export async function getTodosUsuarios() {
  const { data } = await sb()
    .from('spress_usuarios')
    .select('id, nome, email, cargo, foto_url, roles')
    .eq('ativo', true)
    .order('nome')
  return data ?? []
}

export async function criarEquipe(nome: string, descricao?: string): Promise<string> {
  const { data, error } = await sb()
    .from('spress_equipes')
    .insert({ nome, descricao: descricao || null })
    .select('id')
    .single()
  if (error) throw new Error(error.message)
  return data.id
}

export async function atualizarEquipe(id: string, nome: string, descricao?: string) {
  const { error } = await sb()
    .from('spress_equipes')
    .update({ nome, descricao: descricao || null, atualizado_em: new Date().toISOString() })
    .eq('id', id)
  if (error) throw new Error(error.message)
}

export async function excluirEquipe(id: string) {
  const { error } = await sb()
    .from('spress_equipes')
    .delete()
    .eq('id', id)
    .eq('is_empresa', false)
  if (error) throw new Error(error.message)
}

export async function adicionarMembro(
  equipeId: string,
  usuarioId: string,
  parentId?: string,
  cargo?: string,
) {
  const { error } = await sb()
    .from('spress_equipe_membros')
    .insert({
      equipe_id: equipeId,
      usuario_id: usuarioId,
      parent_id: parentId || null,
      cargo_equipe: cargo || null,
    })
  if (error) throw new Error(error.message)
}

export async function atualizarMembro(
  membroId: string,
  parentId: string | null,
  cargo: string | null,
) {
  const { error } = await sb()
    .from('spress_equipe_membros')
    .update({ parent_id: parentId, cargo_equipe: cargo })
    .eq('id', membroId)
  if (error) throw new Error(error.message)
}

export async function removerMembro(membroId: string) {
  const { error } = await sb()
    .from('spress_equipe_membros')
    .delete()
    .eq('id', membroId)
  if (error) throw new Error(error.message)
}
