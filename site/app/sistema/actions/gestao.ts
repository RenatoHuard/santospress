'use server'

import { createClient } from '@supabase/supabase-js'

function serviceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key || key === 'sua_service_role_key_aqui') throw new Error('SERVICE_KEY_NOT_SET')
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key)
}

export interface GestaoCliente  { id: string; nome: string }
export interface GestaoAtendente { id: string; nome: string }

export interface DemandaRow {
  id: string
  titulo: string
  created_at: string
  concluida_em: string | null
  coluna_nome: string
  coluna_ordem: number
  cliente_nome: string
  atendente_nome: string
}

export async function getGestaoClientes(): Promise<GestaoCliente[]> {
  const { data } = await serviceClient()
    .from('spress_clientes')
    .select('id, nome_fantasia, razao_social')
    .eq('status', 'ativo')
    .order('nome_fantasia')
  return (data ?? []).map((c) => ({
    id: c.id,
    nome: c.nome_fantasia || c.razao_social || 'Sem nome',
  }))
}

export async function getGestaoAtendentes(): Promise<GestaoAtendente[]> {
  const { data } = await serviceClient()
    .from('spress_usuarios')
    .select('id, nome')
    .eq('ativo', true)
    .order('nome')
  return (data ?? []).map((u) => ({ id: u.id, nome: u.nome }))
}

export async function getDemandaStats(
  tipo: 'cliente' | 'atendente',
  entityId: string,
  from: string,
  to: string,
): Promise<DemandaRow[]> {
  const sb = serviceClient()

  const filter = tipo === 'cliente' ? { cliente_id: entityId } : { atendente_id: entityId }

  const { data: rawDemands, error } = await sb
    .from('spress_demandas')
    .select('id, titulo, created_at, concluida_em, coluna_id, cliente_id, atendente_id')
    .match(filter)
    .gte('created_at', from)
    .lte('created_at', to)
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)
  const demands = rawDemands ?? []
  if (demands.length === 0) return []

  const colunaIds    = [...new Set(demands.map((d) => d.coluna_id).filter(Boolean))]
  const clienteIds   = [...new Set(demands.map((d) => d.cliente_id).filter(Boolean))]
  const atendenteIds = [...new Set(demands.map((d) => d.atendente_id).filter(Boolean))]

  const [{ data: colunas }, { data: clientes }, { data: atendentes }] = await Promise.all([
    colunaIds.length > 0
      ? sb.from('spress_colunas').select('id, nome, ordem').in('id', colunaIds)
      : { data: [] },
    clienteIds.length > 0
      ? sb.from('spress_clientes').select('id, nome_fantasia, razao_social').in('id', clienteIds)
      : { data: [] },
    atendenteIds.length > 0
      ? sb.from('spress_usuarios').select('id, nome').in('id', atendenteIds)
      : { data: [] },
  ])

  const colunaMap    = Object.fromEntries((colunas    ?? []).map((c) => [c.id, c]))
  const clienteMap   = Object.fromEntries((clientes   ?? []).map((c) => [c.id, c]))
  const atendenteMap = Object.fromEntries((atendentes ?? []).map((u) => [u.id, u]))

  return demands.map((d) => ({
    id:             d.id,
    titulo:         d.titulo || 'Sem título',
    created_at:     d.created_at,
    concluida_em:   d.concluida_em,
    coluna_nome:    colunaMap[d.coluna_id]?.nome   ?? 'Sem coluna',
    coluna_ordem:   colunaMap[d.coluna_id]?.ordem  ?? 99,
    cliente_nome:   clienteMap[d.cliente_id]?.nome_fantasia || clienteMap[d.cliente_id]?.razao_social || 'Sem cliente',
    atendente_nome: atendenteMap[d.atendente_id]?.nome ?? 'Sem atendente',
  }))
}
