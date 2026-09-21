'use server'

import { createClient } from '@supabase/supabase-js'

function sb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export interface Solicitacao {
  id: string
  titulo: string
  descricao: string | null
  tipo: string | null
  prioridade: string
  origem: string
  created_at: string
  visto_em: string | null
  concluida_em: string | null
  cliente_id: string | null
  atendente_id: string | null
  cliente_nome: string | null
}

export async function getSolicitacoes(authUserId: string): Promise<Solicitacao[]> {
  const client = sb()

  const { data: usuario } = await client
    .from('spress_usuarios')
    .select('id, roles')
    .eq('auth_user_id', authUserId)
    .maybeSingle()

  if (!usuario) return []

  const roles: string[] = usuario.roles ?? []
  const isAdmin = roles.includes('admin') || roles.includes('rh')

  let query = client
    .from('spress_demandas')
    .select('id, titulo, descricao, tipo, prioridade, origem, created_at, visto_em, concluida_em, cliente_id, atendente_id')
    .eq('origem', 'portal_cliente')
    .order('created_at', { ascending: false })

  if (!isAdmin) {
    query = query.eq('atendente_id', usuario.id)
  }

  const { data: demandas } = await query
  if (!demandas?.length) return []

  const clienteIds = [...new Set(demandas.map(d => d.cliente_id).filter(Boolean))]
  const { data: clientes } = clienteIds.length
    ? await client
        .from('spress_clientes')
        .select('id, nome_fantasia, razao_social')
        .in('id', clienteIds)
    : { data: [] }

  const clienteMap = Object.fromEntries(
    (clientes ?? []).map(c => [c.id, c.nome_fantasia || c.razao_social || 'Cliente'])
  )

  return demandas.map(d => ({
    ...d,
    cliente_nome: d.cliente_id ? (clienteMap[d.cliente_id] ?? null) : null,
  }))
}

export async function getUnseenSolicitacoesCount(authUserId: string): Promise<number> {
  const client = sb()

  const { data: usuario } = await client
    .from('spress_usuarios')
    .select('id, roles')
    .eq('auth_user_id', authUserId)
    .maybeSingle()

  if (!usuario) return 0

  const roles: string[] = usuario.roles ?? []
  const isAdmin = roles.includes('admin') || roles.includes('rh')

  let query = client
    .from('spress_demandas')
    .select('*', { count: 'exact', head: true })
    .eq('origem', 'portal_cliente')
    .is('visto_em', null)

  if (!isAdmin) {
    query = query.eq('atendente_id', usuario.id)
  }

  const { count } = await query
  return count ?? 0
}

export async function marcarComoVista(demandaId: string): Promise<void> {
  await sb()
    .from('spress_demandas')
    .update({ visto_em: new Date().toISOString() })
    .eq('id', demandaId)
    .is('visto_em', null)
}
