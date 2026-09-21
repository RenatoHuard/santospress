'use server'

import { createClient } from '@supabase/supabase-js'

function sb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

// ── Tipos ────────────────────────────────────────────────────────────

export interface KanbanCard {
  id: string
  titulo: string
  descricao: string | null
  tipo: string | null
  prioridade: string
  origem: string
  ordem: number
  visto_em: string | null
  concluida_em: string | null
  prazo: string | null
  cliente_id: string | null
  cliente_nome: string | null
  atendente_id: string | null
  responsavel_id: string | null
  responsavel_nome: string | null
  responsavel_foto: string | null
  coluna_id: string
  created_at: string
}

export interface KanbanColuna {
  id: string
  nome: string
  ordem: number
  cards: KanbanCard[]
}

export interface UsuarioSimples {
  id: string
  nome: string
  cargo: string | null
  foto_url: string | null
}

export interface ClienteSimples {
  id: string
  nome: string
}

export interface KanbanData {
  quadro: { id: string; nome: string; cliente_id: string | null }
  colunas: KanbanColuna[]
  usuarios: UsuarioSimples[]
  clientes: ClienteSimples[]
}

export interface Quadro {
  id: string
  nome: string
  cliente_id: string | null
  cliente_nome: string | null
  created_at: string
  total_cards: number
}

// ── Quadros ──────────────────────────────────────────────────────────

export async function getQuadros(): Promise<Quadro[]> {
  const client = sb()

  const { data: quadros } = await client
    .from('spress_quadros')
    .select('id, nome, cliente_id, created_at')
    .order('created_at', { ascending: false })

  if (!quadros?.length) return []

  const clienteIds = [...new Set(quadros.map(q => q.cliente_id).filter(Boolean))]
  const { data: clientes } = clienteIds.length
    ? await client.from('spress_clientes').select('id, nome_fantasia, razao_social').in('id', clienteIds)
    : { data: [] }

  const clienteMap = Object.fromEntries((clientes ?? []).map(c => [c.id, c.nome_fantasia || c.razao_social]))

  const { data: counts } = await client
    .from('spress_demandas')
    .select('quadro_id')
    .in('quadro_id', quadros.map(q => q.id))

  const countMap: Record<string, number> = {}
  for (const c of counts ?? []) {
    countMap[c.quadro_id] = (countMap[c.quadro_id] ?? 0) + 1
  }

  return quadros.map(q => ({
    ...q,
    cliente_nome: q.cliente_id ? (clienteMap[q.cliente_id] ?? null) : null,
    total_cards: countMap[q.id] ?? 0,
  }))
}

export async function criarQuadro(nome: string, clienteId?: string): Promise<{ id: string } | null> {
  const { data, error } = await sb()
    .from('spress_quadros')
    .insert({ nome, cliente_id: clienteId ?? null })
    .select('id')
    .single()

  if (error) return null
  return data
}

export async function renomearQuadro(quadroId: string, nome: string): Promise<void> {
  await sb().from('spress_quadros').update({ nome }).eq('id', quadroId)
}

export async function deletarQuadro(quadroId: string): Promise<void> {
  await sb().from('spress_quadros').delete().eq('id', quadroId)
}

// ── Kanban Data ──────────────────────────────────────────────────────

export async function getKanbanData(quadroId: string): Promise<KanbanData | null> {
  const client = sb()

  const [{ data: quadro }, { data: colunas }, { data: demandas }, { data: usuarios }, { data: clientesRaw }] =
    await Promise.all([
      client.from('spress_quadros').select('id, nome, cliente_id').eq('id', quadroId).maybeSingle(),
      client.from('spress_colunas').select('id, nome, ordem').eq('quadro_id', quadroId).order('ordem'),
      client.from('spress_demandas')
        .select('id, titulo, descricao, tipo, prioridade, origem, ordem, visto_em, concluida_em, prazo, cliente_id, atendente_id, responsavel_id, coluna_id, created_at')
        .eq('quadro_id', quadroId)
        .order('ordem'),
      client.from('spress_usuarios').select('id, nome, cargo, foto_url').order('nome'),
      client.from('spress_clientes').select('id, nome_fantasia, razao_social').eq('status', 'ativo').order('nome_fantasia'),
    ])

  if (!quadro || !colunas) return null

  const clienteIds = [...new Set((demandas ?? []).map(d => d.cliente_id).filter(Boolean))]
  const responsavelIds = [...new Set((demandas ?? []).map(d => d.responsavel_id).filter(Boolean))]

  const [{ data: cardClientes }, { data: responsaveis }] = await Promise.all([
    clienteIds.length
      ? client.from('spress_clientes').select('id, nome_fantasia, razao_social').in('id', clienteIds)
      : Promise.resolve({ data: [] }),
    responsavelIds.length
      ? client.from('spress_usuarios').select('id, nome, foto_url').in('id', responsavelIds)
      : Promise.resolve({ data: [] }),
  ])

  const clienteMap = Object.fromEntries((cardClientes ?? []).map(c => [c.id, c.nome_fantasia || c.razao_social]))
  const respMap = Object.fromEntries((responsaveis ?? []).map(u => [u.id, u]))

  const cardsByColunaId: Record<string, KanbanCard[]> = {}
  for (const d of demandas ?? []) {
    if (!d.coluna_id) continue
    if (!cardsByColunaId[d.coluna_id]) cardsByColunaId[d.coluna_id] = []
    cardsByColunaId[d.coluna_id].push({
      ...d,
      cliente_nome: d.cliente_id ? (clienteMap[d.cliente_id] ?? null) : null,
      responsavel_nome: d.responsavel_id ? (respMap[d.responsavel_id]?.nome ?? null) : null,
      responsavel_foto: d.responsavel_id ? (respMap[d.responsavel_id]?.foto_url ?? null) : null,
    })
  }

  return {
    quadro,
    colunas: colunas.map(col => ({ ...col, cards: cardsByColunaId[col.id] ?? [] })),
    usuarios: usuarios ?? [],
    clientes: (clientesRaw ?? []).map(c => ({ id: c.id, nome: c.nome_fantasia || c.razao_social || 'Cliente' })),
  }
}

// ── Colunas ──────────────────────────────────────────────────────────

export async function criarColuna(quadroId: string, nome: string): Promise<{ id: string; ordem: number } | null> {
  const client = sb()
  const { data: last } = await client
    .from('spress_colunas')
    .select('ordem')
    .eq('quadro_id', quadroId)
    .order('ordem', { ascending: false })
    .limit(1)
    .maybeSingle()

  const ordem = (last?.ordem ?? -1) + 1
  const { data, error } = await client
    .from('spress_colunas')
    .insert({ quadro_id: quadroId, nome, ordem })
    .select('id, ordem')
    .single()

  if (error) return null
  return data
}

export async function renomearColuna(colunaId: string, nome: string): Promise<void> {
  await sb().from('spress_colunas').update({ nome }).eq('id', colunaId)
}

export async function deletarColuna(colunaId: string): Promise<void> {
  await sb().from('spress_colunas').delete().eq('id', colunaId)
}

export async function reordenarColunas(reordens: { id: string; ordem: number }[]): Promise<void> {
  const client = sb()
  await Promise.all(reordens.map(r => client.from('spress_colunas').update({ ordem: r.ordem }).eq('id', r.id)))
}

// ── Cards ────────────────────────────────────────────────────────────

export interface NovoCardInput {
  titulo: string
  descricao?: string
  tipo?: string
  prioridade?: string
  cliente_id?: string | null
  responsavel_id?: string | null
  prazo?: string | null
}

export async function criarCard(
  colunaId: string,
  quadroId: string,
  dados: NovoCardInput,
): Promise<KanbanCard | null> {
  const client = sb()

  const { data: last } = await client
    .from('spress_demandas')
    .select('ordem')
    .eq('coluna_id', colunaId)
    .order('ordem', { ascending: false })
    .limit(1)
    .maybeSingle()

  const ordem = (last?.ordem ?? -1) + 1

  const { data, error } = await client
    .from('spress_demandas')
    .insert({
      quadro_id: quadroId,
      coluna_id: colunaId,
      titulo: dados.titulo,
      descricao: dados.descricao ?? null,
      tipo: dados.tipo ?? null,
      prioridade: dados.prioridade ?? 'media',
      cliente_id: dados.cliente_id ?? null,
      responsavel_id: dados.responsavel_id ?? null,
      prazo: dados.prazo ?? null,
      origem: 'interno',
      ordem,
    })
    .select('id, titulo, descricao, tipo, prioridade, origem, ordem, visto_em, concluida_em, prazo, cliente_id, atendente_id, responsavel_id, coluna_id, created_at')
    .single()

  if (error) return null

  return {
    ...data,
    cliente_nome: null,
    responsavel_nome: null,
    responsavel_foto: null,
  }
}

export async function moverCard(cardId: string, colunaId: string, ordem: number): Promise<void> {
  await sb()
    .from('spress_demandas')
    .update({ coluna_id: colunaId, ordem })
    .eq('id', cardId)
}

export async function reordenarCards(reordens: { id: string; ordem: number; coluna_id: string }[]): Promise<void> {
  const client = sb()
  await Promise.all(
    reordens.map(r =>
      client.from('spress_demandas').update({ ordem: r.ordem, coluna_id: r.coluna_id }).eq('id', r.id)
    ),
  )
}

export async function atualizarCard(cardId: string, dados: Partial<NovoCardInput> & { concluida_em?: string | null }): Promise<void> {
  await sb()
    .from('spress_demandas')
    .update({ ...dados, updated_at: new Date().toISOString() })
    .eq('id', cardId)
}

export async function deletarCard(cardId: string): Promise<void> {
  await sb().from('spress_demandas').delete().eq('id', cardId)
}
