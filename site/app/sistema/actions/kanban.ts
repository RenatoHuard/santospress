'use server'

import { createClient } from '@supabase/supabase-js'

function sb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

// ── Tipos ────────────────────────────────────────────────────────────

export interface Etiqueta {
  id: string
  quadro_id: string
  nome: string | null
  cor: string
}

export interface Comentario {
  id: string
  demanda_id: string
  autor_id: string
  autor_nome: string | null
  autor_foto: string | null
  texto: string
  created_at: string
}

export interface ChecklistItem {
  id: string
  demanda_id: string
  texto: string
  concluido: boolean
  ordem: number
  created_at: string
}

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
  etiquetas: Etiqueta[]
  checklist_total: number
  checklist_done: number
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
  roles?: string[]
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
  etiquetas: Etiqueta[]
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

export async function getQuadrosParaColaborador(usuarioId: string): Promise<Quadro[]> {
  if (!usuarioId) return []
  const client = sb()

  // quadros via cards atribuídos
  const { data: demandas } = await client
    .from('spress_demandas')
    .select('quadro_id')
    .eq('responsavel_id', usuarioId)

  // quadros via membership explícita
  const { data: memberships } = await client
    .from('spress_quadro_membros')
    .select('quadro_id')
    .eq('usuario_id', usuarioId)

  const quadroIds = [...new Set([
    ...(demandas ?? []).map(d => d.quadro_id),
    ...(memberships ?? []).map(m => m.quadro_id),
  ].filter(Boolean))]

  if (!quadroIds.length) return []

  const { data: quadros } = await client
    .from('spress_quadros')
    .select('id, nome, cliente_id, created_at')
    .in('id', quadroIds)
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
    .in('quadro_id', quadroIds)
    .eq('responsavel_id', usuarioId)

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

  const [{ data: quadro }, { data: colunas }, { data: demandas }, { data: usuarios }, { data: clientesRaw }, { data: etiquetasBoard }] =
    await Promise.all([
      client.from('spress_quadros').select('id, nome, cliente_id').eq('id', quadroId).maybeSingle(),
      client.from('spress_colunas').select('id, nome, ordem').eq('quadro_id', quadroId).order('ordem'),
      client.from('spress_demandas')
        .select('id, titulo, descricao, tipo, prioridade, origem, ordem, visto_em, concluida_em, prazo, cliente_id, atendente_id, responsavel_id, coluna_id, created_at')
        .eq('quadro_id', quadroId)
        .order('ordem'),
      client.from('spress_usuarios').select('id, nome, cargo, foto_url').order('nome'),
      client.from('spress_clientes').select('id, nome_fantasia, razao_social').eq('status', 'ativo').order('nome_fantasia'),
      client.from('spress_etiquetas').select('id, quadro_id, nome, cor').eq('quadro_id', quadroId),
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
  const etiquetaMap = Object.fromEntries((etiquetasBoard ?? []).map(e => [e.id, e]))

  const demandaIds = (demandas ?? []).map(d => d.id)

  const [{ data: demandaEtiquetas }, { data: checklistRaw }] = await Promise.all([
    demandaIds.length
      ? client.from('spress_demanda_etiquetas').select('demanda_id, etiqueta_id').in('demanda_id', demandaIds)
      : Promise.resolve({ data: [] }),
    demandaIds.length
      ? client.from('spress_checklist_items').select('demanda_id, concluido').in('demanda_id', demandaIds)
      : Promise.resolve({ data: [] }),
  ])

  const cardEtiquetasMap: Record<string, Etiqueta[]> = {}
  for (const de of demandaEtiquetas ?? []) {
    const etiqueta = etiquetaMap[de.etiqueta_id]
    if (!etiqueta) continue
    if (!cardEtiquetasMap[de.demanda_id]) cardEtiquetasMap[de.demanda_id] = []
    cardEtiquetasMap[de.demanda_id].push(etiqueta)
  }

  const checklistCountMap: Record<string, { total: number; done: number }> = {}
  for (const ci of checklistRaw ?? []) {
    if (!checklistCountMap[ci.demanda_id]) checklistCountMap[ci.demanda_id] = { total: 0, done: 0 }
    checklistCountMap[ci.demanda_id].total++
    if (ci.concluido) checklistCountMap[ci.demanda_id].done++
  }

  const cardsByColunaId: Record<string, KanbanCard[]> = {}
  for (const d of demandas ?? []) {
    if (!d.coluna_id) continue
    if (!cardsByColunaId[d.coluna_id]) cardsByColunaId[d.coluna_id] = []
    cardsByColunaId[d.coluna_id].push({
      ...d,
      cliente_nome: d.cliente_id ? (clienteMap[d.cliente_id] ?? null) : null,
      responsavel_nome: d.responsavel_id ? (respMap[d.responsavel_id]?.nome ?? null) : null,
      responsavel_foto: d.responsavel_id ? (respMap[d.responsavel_id]?.foto_url ?? null) : null,
      etiquetas: cardEtiquetasMap[d.id] ?? [],
      checklist_total: checklistCountMap[d.id]?.total ?? 0,
      checklist_done:  checklistCountMap[d.id]?.done  ?? 0,
    })
  }

  return {
    quadro,
    colunas: colunas.map(col => ({ ...col, cards: cardsByColunaId[col.id] ?? [] })),
    usuarios: usuarios ?? [],
    clientes: (clientesRaw ?? []).map(c => ({ id: c.id, nome: c.nome_fantasia || c.razao_social || 'Cliente' })),
    etiquetas: etiquetasBoard ?? [],
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
    etiquetas: [],
    checklist_total: 0,
    checklist_done: 0,
  }
}

// ── Checklist ────────────────────────────────────────────────────────

export async function getChecklist(demandaId: string): Promise<ChecklistItem[]> {
  const { data } = await sb()
    .from('spress_checklist_items')
    .select('id, demanda_id, texto, concluido, ordem, created_at')
    .eq('demanda_id', demandaId)
    .order('ordem')
  return data ?? []
}

export async function addChecklistItem(demandaId: string, texto: string): Promise<ChecklistItem | null> {
  const client = sb()
  const { data: last } = await client
    .from('spress_checklist_items')
    .select('ordem')
    .eq('demanda_id', demandaId)
    .order('ordem', { ascending: false })
    .limit(1)
    .maybeSingle()
  const ordem = (last?.ordem ?? -1) + 1
  const { data } = await client
    .from('spress_checklist_items')
    .insert({ demanda_id: demandaId, texto, ordem })
    .select('id, demanda_id, texto, concluido, ordem, created_at')
    .single()
  return data ?? null
}

export async function toggleChecklistItem(itemId: string, concluido: boolean): Promise<void> {
  await sb().from('spress_checklist_items').update({ concluido }).eq('id', itemId)
}

export async function deleteChecklistItem(itemId: string): Promise<void> {
  await sb().from('spress_checklist_items').delete().eq('id', itemId)
}

// ── Etiquetas ────────────────────────────────────────────────────────

export async function getEtiquetasBoard(quadroId: string): Promise<Etiqueta[]> {
  const { data } = await sb().from('spress_etiquetas').select('id, quadro_id, nome, cor').eq('quadro_id', quadroId)
  return data ?? []
}

export async function criarEtiqueta(quadroId: string, cor: string, nome?: string): Promise<Etiqueta | null> {
  const { data, error } = await sb()
    .from('spress_etiquetas')
    .insert({ quadro_id: quadroId, cor, nome: nome || null })
    .select('id, quadro_id, nome, cor')
    .single()
  if (error) return null
  return data
}

export async function atualizarEtiqueta(etiquetaId: string, dados: { nome?: string | null; cor?: string }): Promise<void> {
  await sb().from('spress_etiquetas').update(dados).eq('id', etiquetaId)
}

export async function deletarEtiqueta(etiquetaId: string): Promise<void> {
  await sb().from('spress_etiquetas').delete().eq('id', etiquetaId)
}

export async function toggleEtiquetaCard(demandaId: string, etiquetaId: string, ativo: boolean): Promise<void> {
  const client = sb()
  if (ativo) {
    await client.from('spress_demanda_etiquetas').insert({ demanda_id: demandaId, etiqueta_id: etiquetaId })
  } else {
    await client.from('spress_demanda_etiquetas').delete().eq('demanda_id', demandaId).eq('etiqueta_id', etiquetaId)
  }
}

// ── Comentários ──────────────────────────────────────────────────────

export async function getComentarios(demandaId: string): Promise<Comentario[]> {
  const client = sb()
  const { data: rows } = await client
    .from('spress_demanda_comentarios')
    .select('id, demanda_id, autor_id, texto, created_at')
    .eq('demanda_id', demandaId)
    .order('created_at', { ascending: true })

  if (!rows?.length) return []

  const autorIds = [...new Set(rows.map(r => r.autor_id))]
  const { data: usuarios } = await client
    .from('spress_usuarios')
    .select('auth_user_id, nome, foto_url')
    .in('auth_user_id', autorIds)

  const userMap = Object.fromEntries((usuarios ?? []).map(u => [u.auth_user_id, u]))

  return rows.map(r => ({
    id: r.id,
    demanda_id: r.demanda_id,
    autor_id: r.autor_id,
    autor_nome: userMap[r.autor_id]?.nome ?? null,
    autor_foto: userMap[r.autor_id]?.foto_url ?? null,
    texto: r.texto,
    created_at: r.created_at,
  }))
}

export async function addComentario(
  demandaId: string,
  texto: string,
  autorId: string,
  autorNome?: string | null,
): Promise<{ data: Comentario | null; error: string | null }> {
  const { data, error } = await sb()
    .from('spress_demanda_comentarios')
    .insert({ demanda_id: demandaId, texto, autor_id: autorId })
    .select('id, demanda_id, autor_id, texto, created_at')
    .single()
  if (error) return { data: null, error: error.message }
  return {
    data: { ...data, autor_nome: autorNome ?? null, autor_foto: null },
    error: null,
  }
}

export async function deleteComentario(comentarioId: string): Promise<void> {
  await sb().from('spress_demanda_comentarios').delete().eq('id', comentarioId)
}

// ── Calendário ───────────────────────────────────────────────────────

export interface CalendarioCard extends KanbanCard {
  quadro_id: string
  quadro_nome: string | null
  coluna_nome: string | null
}

export interface CalendarioData {
  cards: CalendarioCard[]
  usuarios: UsuarioSimples[]
  clientes: ClienteSimples[]
  etiquetasByQuadro: Record<string, Etiqueta[]>
}

export async function getCalendarioData(): Promise<CalendarioData> {
  const client = sb()

  const [
    { data: demandas },
    { data: usuarios },
    { data: clientesRaw },
    { data: quadros },
    { data: colunas },
    { data: etiquetas },
    { data: demandaEtiquetas },
    { data: checklistAllRaw },
  ] = await Promise.all([
    client.from('spress_demandas')
      .select('id, titulo, descricao, tipo, prioridade, origem, ordem, visto_em, concluida_em, prazo, cliente_id, atendente_id, responsavel_id, coluna_id, quadro_id, created_at')
      .not('prazo', 'is', null),
    client.from('spress_usuarios').select('id, nome, cargo, foto_url, roles').order('nome'),
    client.from('spress_clientes').select('id, nome_fantasia, razao_social').eq('status', 'ativo'),
    client.from('spress_quadros').select('id, nome'),
    client.from('spress_colunas').select('id, nome'),
    client.from('spress_etiquetas').select('id, quadro_id, nome, cor'),
    client.from('spress_demanda_etiquetas').select('demanda_id, etiqueta_id'),
    client.from('spress_checklist_items').select('demanda_id, concluido'),
  ])

  const clienteMap  = Object.fromEntries((clientesRaw ?? []).map(c => [c.id, c.nome_fantasia || c.razao_social]))
  const quadroMap   = Object.fromEntries((quadros ?? []).map(q => [q.id, q.nome]))
  const colunaMap   = Object.fromEntries((colunas ?? []).map(c => [c.id, c.nome]))
  const etiquetaMap = Object.fromEntries((etiquetas ?? []).map(e => [e.id, e]))
  const respMap     = Object.fromEntries((usuarios ?? []).map(u => [u.id, u]))

  const cardEtiquetasMap: Record<string, Etiqueta[]> = {}
  for (const de of demandaEtiquetas ?? []) {
    const et = etiquetaMap[de.etiqueta_id]
    if (!et) continue
    if (!cardEtiquetasMap[de.demanda_id]) cardEtiquetasMap[de.demanda_id] = []
    cardEtiquetasMap[de.demanda_id].push(et)
  }

  const checklistCountMap: Record<string, { total: number; done: number }> = {}
  for (const ci of checklistAllRaw ?? []) {
    if (!checklistCountMap[ci.demanda_id]) checklistCountMap[ci.demanda_id] = { total: 0, done: 0 }
    checklistCountMap[ci.demanda_id].total++
    if (ci.concluido) checklistCountMap[ci.demanda_id].done++
  }

  const etiquetasByQuadro: Record<string, Etiqueta[]> = {}
  for (const e of etiquetas ?? []) {
    if (!etiquetasByQuadro[e.quadro_id]) etiquetasByQuadro[e.quadro_id] = []
    etiquetasByQuadro[e.quadro_id].push(e)
  }

  const cards: CalendarioCard[] = (demandas ?? []).map(d => ({
    id: d.id,
    titulo: d.titulo,
    descricao: d.descricao ?? null,
    tipo: d.tipo ?? null,
    prioridade: d.prioridade,
    origem: d.origem,
    ordem: d.ordem,
    visto_em: d.visto_em ?? null,
    concluida_em: d.concluida_em ?? null,
    prazo: d.prazo,
    cliente_id: d.cliente_id ?? null,
    cliente_nome: d.cliente_id ? (clienteMap[d.cliente_id] ?? null) : null,
    atendente_id: d.atendente_id ?? null,
    responsavel_id: d.responsavel_id ?? null,
    responsavel_nome: d.responsavel_id ? (respMap[d.responsavel_id]?.nome ?? null) : null,
    responsavel_foto: d.responsavel_id ? (respMap[d.responsavel_id]?.foto_url ?? null) : null,
    coluna_id: d.coluna_id,
    created_at: d.created_at,
    etiquetas: cardEtiquetasMap[d.id] ?? [],
    checklist_total: checklistCountMap[d.id]?.total ?? 0,
    checklist_done:  checklistCountMap[d.id]?.done  ?? 0,
    quadro_id: d.quadro_id,
    quadro_nome: d.quadro_id ? (quadroMap[d.quadro_id] ?? null) : null,
    coluna_nome: d.coluna_id ? (colunaMap[d.coluna_id] ?? null) : null,
  }))

  return {
    cards,
    usuarios: usuarios ?? [],
    clientes: (clientesRaw ?? []).map(c => ({ id: c.id, nome: c.nome_fantasia || c.razao_social || 'Cliente' })),
    etiquetasByQuadro,
  }
}

// ── Membros do Quadro ────────────────────────────────────────────────

export async function getMembrosQuadro(quadroId: string): Promise<UsuarioSimples[]> {
  const client = sb()
  const { data } = await client
    .from('spress_quadro_membros')
    .select('usuario_id')
    .eq('quadro_id', quadroId)

  const ids = (data ?? []).map(r => r.usuario_id)
  if (!ids.length) return []

  const { data: usuarios } = await client
    .from('spress_usuarios')
    .select('id, nome, cargo, foto_url, roles')
    .in('id', ids)
    .order('nome')

  return usuarios ?? []
}

export async function adicionarMembroQuadro(quadroId: string, usuarioId: string): Promise<void> {
  await sb()
    .from('spress_quadro_membros')
    .upsert({ quadro_id: quadroId, usuario_id: usuarioId })
}

export async function removerMembroQuadro(quadroId: string, usuarioId: string): Promise<void> {
  await sb()
    .from('spress_quadro_membros')
    .delete()
    .eq('quadro_id', quadroId)
    .eq('usuario_id', usuarioId)
}

// ── Auth ─────────────────────────────────────────────────────────────

export async function getUsuarioByAuthId(authUserId: string): Promise<UsuarioSimples | null> {
  const { data } = await sb()
    .from('spress_usuarios')
    .select('id, nome, cargo, foto_url, roles')
    .eq('auth_user_id', authUserId)
    .maybeSingle()
  return data ?? null
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
