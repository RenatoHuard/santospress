'use server'

import { createClient } from '@supabase/supabase-js'
import { requireStaff } from '@/lib/auth-guard'

function sb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

// ── Tipos ────────────────────────────────────────────────────────────

export interface Veiculo {
  id: string
  nome: string
  tipo: string | null
  regiao: string | null
  cidade: string | null
  tier: 'tier1' | 'tier2' | 'tier3' | null
  periodicidade: string | null
  principal: boolean
  ativo: boolean
  observacoes: string | null
  created_at: string
  updated_at: string
}

export interface Jornalista {
  id: string
  nome: string
  email: string | null
  telefone: string | null
  whatsapp: string | null
  cargo: string | null
  editoria: string | null
  programa: string | null
  regiao: string | null
  situacao: 'ativo' | 'desatualizado' | 'revisar' | 'inativo'
  observacoes: string | null
  veiculo_id: string | null
  veiculo_nome: string | null
  responsavel_id: string | null
  created_at: string
  updated_at: string
}

export interface JornalistaMetrica {
  jornalista_id: string
  nome: string
  situacao: string
  envios: number
  respondidos: number
  publicados: number
  taxa_resposta: number
  taxa_publicacao: number
  tempo_medio_resposta_horas: number | null
  ultimo_envio: string | null
  ultima_publicacao: string | null
  envios_seguidos_sem_resposta: number
}

export interface VeiculoMetrica {
  veiculo_id: string
  nome: string
  envios: number
  respondidos: number
  publicados: number
  taxa_resposta: number
  taxa_publicacao: number
  tempo_medio_resposta_horas: number | null
  ultimo_envio: string | null
  ultima_publicacao: string | null
}

export interface Release {
  id: string
  titulo: string
  corpo: string | null
  cliente_id: string | null
  cliente_nome: string | null
  responsavel_id: string | null
  responsavel_nome: string | null
  arquivo_url: string | null
  created_at: string
  updated_at: string
}

export interface Disparo {
  id: string
  pauta_id: string
  pauta_titulo: string | null
  jornalista_id: string | null
  jornalista_nome: string | null
  veiculo_id: string | null
  veiculo_nome: string | null
  canal: 'email' | 'whatsapp' | 'telefone' | 'presencial' | 'outro' | null
  enviado_em: string | null
  status: 'enviado' | 'respondido' | 'publicado' | 'recusado' | 'sem_resposta'
  respondido_em: string | null
  ultimo_followup_em: string | null
  qtd_followups: number
  observacoes: string | null
  enviado_por: string | null
  updated_at: string
}

export interface Clipping {
  id: string
  cliente_id: string | null
  cliente_nome: string | null
  veiculo_id: string | null
  veiculo_nome: string | null
  jornalista_id: string | null
  jornalista_nome: string | null
  disparo_id: string | null
  titulo: string | null
  url: string | null
  formato: 'materia' | 'nota' | 'artigo' | 'entrevista' | 'impresso' | 'reels' | 'shorts' | 'video' | 'post' | 'podcast' | 'outro' | null
  data_publicacao: string | null
  registrado_por: string | null
  created_at: string
  updated_at: string
}

export interface Meta {
  id: string
  cliente_id: string
  cliente_nome: string | null
  mes: string
  meta: number
  observacoes: string | null
  created_at: string
  updated_at: string
}

export interface ClienteMetaMes {
  cliente_id: string
  cliente_nome: string | null
  mes: string
  meta: number
  realizado: number
  percentual: number
  ritmo_esperado: number
}

export interface Mailing {
  id: string
  nome: string
  descricao: string | null
  cliente_id: string | null
  filtros: Record<string, unknown>
  campos: string[]
  opcoes: Record<string, unknown>
  incluidos: string[]
  excluidos: string[]
  criado_por: string | null
  created_at: string
  updated_at: string
}

export interface ImprensaConfig {
  chave: string
  valor: Record<string, unknown>
}

// ── Veículos ─────────────────────────────────────────────────────────

export async function getVeiculos(filtros?: {
  ativo?: boolean
  tier?: string
  regiao?: string
  busca?: string
}) {
  await requireStaff()

  let q = sb()
    .from('spress_veiculos_imprensa')
    .select('*')
    .order('principal', { ascending: false })
    .order('nome')

  if (filtros?.ativo !== undefined) q = q.eq('ativo', filtros.ativo)
  if (filtros?.tier) q = q.eq('tier', filtros.tier)
  if (filtros?.regiao) q = q.eq('regiao', filtros.regiao)
  if (filtros?.busca) q = q.ilike('nome', `%${filtros.busca}%`)

  const { data, error } = await q
  if (error) throw new Error(error.message)
  return data as Veiculo[]
}

export async function getVeiculo(id: string) {
  await requireStaff()
  const { data, error } = await sb()
    .from('spress_veiculos_imprensa')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw new Error(error.message)
  return data as Veiculo
}

export async function criarVeiculo(input: {
  nome: string
  tipo?: string
  regiao?: string
  cidade?: string
  tier?: 'tier1' | 'tier2' | 'tier3'
  periodicidade?: string
  principal?: boolean
  ativo?: boolean
  observacoes?: string
}) {
  await requireStaff()
  const { data, error } = await sb()
    .from('spress_veiculos_imprensa')
    .insert(input)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as Veiculo
}

export async function atualizarVeiculo(id: string, input: Partial<Omit<Veiculo, 'id' | 'created_at' | 'updated_at'>>) {
  await requireStaff()
  const { data, error } = await sb()
    .from('spress_veiculos_imprensa')
    .update(input)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as Veiculo
}

export async function deletarVeiculo(id: string) {
  await requireStaff()
  const { error } = await sb()
    .from('spress_veiculos_imprensa')
    .delete()
    .eq('id', id)
  if (error) throw new Error(error.message)
}

// ── Jornalistas ───────────────────────────────────────────────────────

export async function getJornalistas(filtros?: {
  situacao?: string
  veiculo_id?: string
  regiao?: string
  editoria?: string
  busca?: string
  page?: number
  perPage?: number
}) {
  await requireStaff()

  const page = filtros?.page ?? 1
  const perPage = filtros?.perPage ?? 50
  const from = (page - 1) * perPage
  const to = from + perPage - 1

  let q = sb()
    .from('spress_jornalistas')
    .select(`
      *,
      spress_veiculos_imprensa!veiculo_id(nome)
    `, { count: 'exact' })
    .order('nome')
    .range(from, to)

  if (filtros?.situacao) q = q.eq('situacao', filtros.situacao)
  if (filtros?.veiculo_id) q = q.eq('veiculo_id', filtros.veiculo_id)
  if (filtros?.regiao) q = q.eq('regiao', filtros.regiao)
  if (filtros?.editoria) q = q.ilike('editoria', `%${filtros.editoria}%`)
  if (filtros?.busca) q = q.or(`nome.ilike.%${filtros.busca}%,email.ilike.%${filtros.busca}%`)

  const { data, error, count } = await q
  if (error) throw new Error(error.message)

  const rows = (data ?? []).map((r: Record<string, unknown>) => ({
    ...r,
    veiculo_nome: (r.spress_veiculos_imprensa as { nome: string } | null)?.nome ?? null,
  })) as Jornalista[]

  return { rows, total: count ?? 0 }
}

export async function getJornalista(id: string) {
  await requireStaff()
  const { data, error } = await sb()
    .from('spress_jornalistas')
    .select(`*, spress_veiculos_imprensa!veiculo_id(nome)`)
    .eq('id', id)
    .single()
  if (error) throw new Error(error.message)
  return {
    ...data,
    veiculo_nome: (data.spress_veiculos_imprensa as { nome: string } | null)?.nome ?? null,
  } as Jornalista
}

export async function criarJornalista(input: {
  nome: string
  email?: string
  telefone?: string
  whatsapp?: string
  cargo?: string
  editoria?: string
  programa?: string
  regiao?: string
  veiculo_id?: string
  situacao?: 'ativo' | 'desatualizado' | 'revisar' | 'inativo'
  observacoes?: string
  responsavel_id?: string
}) {
  await requireStaff()
  const { data, error } = await sb()
    .from('spress_jornalistas')
    .insert(input)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as Jornalista
}

export async function atualizarJornalista(id: string, input: Partial<Omit<Jornalista, 'id' | 'created_at' | 'updated_at' | 'veiculo_nome'>>) {
  await requireStaff()
  const { data, error } = await sb()
    .from('spress_jornalistas')
    .update(input)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as Jornalista
}

export async function deletarJornalista(id: string) {
  await requireStaff()
  const { error } = await sb()
    .from('spress_jornalistas')
    .delete()
    .eq('id', id)
  if (error) throw new Error(error.message)
}

// ── Releases (pautas) ─────────────────────────────────────────────────

export async function getReleases(filtros?: {
  cliente_id?: string
  busca?: string
  page?: number
  perPage?: number
}) {
  await requireStaff()

  const page = filtros?.page ?? 1
  const perPage = filtros?.perPage ?? 30
  const from = (page - 1) * perPage
  const to = from + perPage - 1

  let q = sb()
    .from('spress_pautas')
    .select(`
      *,
      spress_clientes!cliente_id(nome_fantasia),
      responsavel:spress_usuarios!responsavel_id(nome)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (filtros?.cliente_id) q = q.eq('cliente_id', filtros.cliente_id)
  if (filtros?.busca) q = q.ilike('titulo', `%${filtros.busca}%`)

  const { data, error, count } = await q
  if (error) throw new Error(error.message)

  const rows = (data ?? []).map((r: Record<string, unknown>) => ({
    ...r,
    cliente_nome: (r.spress_clientes as { nome_fantasia: string } | null)?.nome_fantasia ?? null,
    responsavel_nome: (r.responsavel as { nome: string } | null)?.nome ?? null,
  })) as Release[]

  return { rows, total: count ?? 0 }
}

export async function getRelease(id: string) {
  await requireStaff()
  const { data, error } = await sb()
    .from('spress_pautas')
    .select(`*, spress_clientes!cliente_id(nome_fantasia), responsavel:spress_usuarios!responsavel_id(nome)`)
    .eq('id', id)
    .single()
  if (error) throw new Error(error.message)
  return {
    ...data,
    cliente_nome: (data.spress_clientes as { nome_fantasia: string } | null)?.nome_fantasia ?? null,
    responsavel_nome: (data.responsavel as { nome: string } | null)?.nome ?? null,
  } as Release
}

export async function criarRelease(input: {
  titulo: string
  corpo?: string
  cliente_id?: string
  responsavel_id?: string
  arquivo_url?: string
}) {
  await requireStaff()
  const { data, error } = await sb()
    .from('spress_pautas')
    .insert(input)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as Release
}

export async function atualizarRelease(id: string, input: Partial<Omit<Release, 'id' | 'created_at' | 'updated_at' | 'cliente_nome' | 'responsavel_nome'>>) {
  await requireStaff()
  const { data, error } = await sb()
    .from('spress_pautas')
    .update(input)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as Release
}

export async function deletarRelease(id: string) {
  await requireStaff()
  const { error } = await sb()
    .from('spress_pautas')
    .delete()
    .eq('id', id)
  if (error) throw new Error(error.message)
}

// ── Disparos ──────────────────────────────────────────────────────────

export async function getDisparos(filtros?: {
  pauta_id?: string
  jornalista_id?: string
  veiculo_id?: string
  status?: string
  page?: number
  perPage?: number
}) {
  await requireStaff()

  const page = filtros?.page ?? 1
  const perPage = filtros?.perPage ?? 50
  const from = (page - 1) * perPage
  const to = from + perPage - 1

  let q = sb()
    .from('spress_pautas_veiculos')
    .select(`
      *,
      pauta:spress_pautas!pauta_id(titulo),
      jornalista:spress_jornalistas!jornalista_id(nome),
      veiculo:spress_veiculos_imprensa!veiculo_id(nome)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (filtros?.pauta_id) q = q.eq('pauta_id', filtros.pauta_id)
  if (filtros?.jornalista_id) q = q.eq('jornalista_id', filtros.jornalista_id)
  if (filtros?.veiculo_id) q = q.eq('veiculo_id', filtros.veiculo_id)
  if (filtros?.status) q = q.eq('status', filtros.status)

  const { data, error, count } = await q
  if (error) throw new Error(error.message)

  const rows = (data ?? []).map((r: Record<string, unknown>) => ({
    ...r,
    pauta_titulo: (r.pauta as { titulo: string } | null)?.titulo ?? null,
    jornalista_nome: (r.jornalista as { nome: string } | null)?.nome ?? null,
    veiculo_nome: (r.veiculo as { nome: string } | null)?.nome ?? null,
  })) as Disparo[]

  return { rows, total: count ?? 0 }
}

export async function criarDisparo(input: {
  pauta_id: string
  jornalista_id?: string
  veiculo_id?: string
  canal?: 'email' | 'whatsapp' | 'telefone' | 'presencial' | 'outro'
  enviado_em?: string
  observacoes?: string
  enviado_por?: string
}) {
  await requireStaff()
  const { data, error } = await sb()
    .from('spress_pautas_veiculos')
    .insert({ ...input, status: 'enviado' })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as Disparo
}

export async function atualizarDisparo(id: string, input: {
  status?: 'enviado' | 'respondido' | 'publicado' | 'recusado' | 'sem_resposta'
  respondido_em?: string | null
  ultimo_followup_em?: string | null
  qtd_followups?: number
  observacoes?: string | null
  canal?: 'email' | 'whatsapp' | 'telefone' | 'presencial' | 'outro' | null
}) {
  await requireStaff()
  const { data, error } = await sb()
    .from('spress_pautas_veiculos')
    .update(input)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as Disparo
}

export async function registrarFollowup(id: string, observacoes?: string) {
  await requireStaff()
  const { data: current, error: fetchErr } = await sb()
    .from('spress_pautas_veiculos')
    .select('qtd_followups')
    .eq('id', id)
    .single()
  if (fetchErr) throw new Error(fetchErr.message)

  const { data, error } = await sb()
    .from('spress_pautas_veiculos')
    .update({
      qtd_followups: (current.qtd_followups ?? 0) + 1,
      ultimo_followup_em: new Date().toISOString(),
      ...(observacoes ? { observacoes } : {}),
    })
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as Disparo
}

export async function deletarDisparo(id: string) {
  await requireStaff()
  const { error } = await sb()
    .from('spress_pautas_veiculos')
    .delete()
    .eq('id', id)
  if (error) throw new Error(error.message)
}

// ── Clipping ──────────────────────────────────────────────────────────

export async function getClippings(filtros?: {
  cliente_id?: string
  veiculo_id?: string
  jornalista_id?: string
  formato?: string
  dataInicio?: string
  dataFim?: string
  page?: number
  perPage?: number
}) {
  await requireStaff()

  const page = filtros?.page ?? 1
  const perPage = filtros?.perPage ?? 50
  const from = (page - 1) * perPage
  const to = from + perPage - 1

  let q = sb()
    .from('spress_clipping')
    .select(`
      *,
      spress_clientes!cliente_id(nome_fantasia),
      veiculo:spress_veiculos_imprensa!veiculo_id(nome),
      jornalista:spress_jornalistas!jornalista_id(nome)
    `, { count: 'exact' })
    .order('data_publicacao', { ascending: false })
    .range(from, to)

  if (filtros?.cliente_id) q = q.eq('cliente_id', filtros.cliente_id)
  if (filtros?.veiculo_id) q = q.eq('veiculo_id', filtros.veiculo_id)
  if (filtros?.jornalista_id) q = q.eq('jornalista_id', filtros.jornalista_id)
  if (filtros?.formato) q = q.eq('formato', filtros.formato)
  if (filtros?.dataInicio) q = q.gte('data_publicacao', filtros.dataInicio)
  if (filtros?.dataFim) q = q.lte('data_publicacao', filtros.dataFim)

  const { data, error, count } = await q
  if (error) throw new Error(error.message)

  const rows = (data ?? []).map((r: Record<string, unknown>) => ({
    ...r,
    cliente_nome: (r.spress_clientes as { nome_fantasia: string } | null)?.nome_fantasia ?? null,
    veiculo_nome: (r.veiculo as { nome: string } | null)?.nome ?? null,
    jornalista_nome: (r.jornalista as { nome: string } | null)?.nome ?? null,
  })) as Clipping[]

  return { rows, total: count ?? 0 }
}

export async function criarClipping(input: {
  cliente_id?: string
  veiculo_id?: string
  jornalista_id?: string
  disparo_id?: string
  titulo?: string
  url?: string
  formato?: Clipping['formato']
  data_publicacao?: string
  registrado_por?: string
}) {
  await requireStaff()
  const { data, error } = await sb()
    .from('spress_clipping')
    .insert(input)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as Clipping
}

export async function atualizarClipping(id: string, input: Partial<Omit<Clipping, 'id' | 'created_at' | 'updated_at' | 'cliente_nome' | 'veiculo_nome' | 'jornalista_nome'>>) {
  await requireStaff()
  const { data, error } = await sb()
    .from('spress_clipping')
    .update(input)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as Clipping
}

export async function deletarClipping(id: string) {
  await requireStaff()
  const { error } = await sb()
    .from('spress_clipping')
    .delete()
    .eq('id', id)
  if (error) throw new Error(error.message)
}

// ── Metas ─────────────────────────────────────────────────────────────

export async function getMetas(filtros?: {
  cliente_id?: string
  mesInicio?: string
  mesFim?: string
}) {
  await requireStaff()

  let q = sb()
    .from('spress_imprensa_metas')
    .select(`*, spress_clientes!cliente_id(nome_fantasia)`)
    .order('mes', { ascending: false })

  if (filtros?.cliente_id) q = q.eq('cliente_id', filtros.cliente_id)
  if (filtros?.mesInicio) q = q.gte('mes', filtros.mesInicio)
  if (filtros?.mesFim) q = q.lte('mes', filtros.mesFim)

  const { data, error } = await q
  if (error) throw new Error(error.message)
  return (data ?? []).map((r: Record<string, unknown>) => ({
    ...r,
    cliente_nome: (r.spress_clientes as { nome_fantasia: string } | null)?.nome_fantasia ?? null,
  })) as Meta[]
}

export async function upsertMeta(input: {
  cliente_id: string
  mes: string
  meta: number
  observacoes?: string
}) {
  await requireStaff()
  const { data, error } = await sb()
    .from('spress_imprensa_metas')
    .upsert(input, { onConflict: 'cliente_id,mes' })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as Meta
}

export async function deletarMeta(id: string) {
  await requireStaff()
  const { error } = await sb()
    .from('spress_imprensa_metas')
    .delete()
    .eq('id', id)
  if (error) throw new Error(error.message)
}

// ── Métricas (views) ──────────────────────────────────────────────────

export async function getMetricasJornalistas(filtros?: { situacao?: string; busca?: string }) {
  await requireStaff()

  let q = sb()
    .from('spress_v_jornalista_metricas')
    .select('*')
    .order('envios', { ascending: false })

  if (filtros?.situacao) q = q.eq('situacao', filtros.situacao)
  if (filtros?.busca) q = q.ilike('nome', `%${filtros.busca}%`)

  const { data, error } = await q
  if (error) throw new Error(error.message)
  return data as JornalistaMetrica[]
}

export async function getMetricasVeiculos() {
  await requireStaff()
  const { data, error } = await sb()
    .from('spress_v_veiculo_metricas')
    .select('*')
    .order('envios', { ascending: false })
  if (error) throw new Error(error.message)
  return data as VeiculoMetrica[]
}

export async function getMetasMes(mes?: string) {
  await requireStaff()
  const mesAlvo = mes ?? new Date().toISOString().substring(0, 7) + '-01'
  const { data, error } = await sb()
    .from('spress_v_cliente_meta_mes')
    .select('*')
    .eq('mes', mesAlvo)
    .order('percentual', { ascending: false })
  if (error) throw new Error(error.message)
  return data as ClienteMetaMes[]
}

// ── Mailing ───────────────────────────────────────────────────────────

export async function getMailings(filtros?: { cliente_id?: string; busca?: string }) {
  await requireStaff()

  let q = sb()
    .from('spress_imprensa_mailings')
    .select('*')
    .order('updated_at', { ascending: false })

  if (filtros?.cliente_id) q = q.eq('cliente_id', filtros.cliente_id)
  if (filtros?.busca) q = q.ilike('nome', `%${filtros.busca}%`)

  const { data, error } = await q
  if (error) throw new Error(error.message)
  return data as Mailing[]
}

export async function getMailing(id: string) {
  await requireStaff()
  const { data, error } = await sb()
    .from('spress_imprensa_mailings')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw new Error(error.message)
  return data as Mailing
}

export async function salvarMailing(input: {
  nome: string
  descricao?: string
  cliente_id?: string | null
  filtros: Record<string, unknown>
  campos: string[]
  opcoes?: Record<string, unknown>
  incluidos?: string[]
  excluidos?: string[]
  criado_por?: string
}) {
  await requireStaff()
  const { data, error } = await sb()
    .from('spress_imprensa_mailings')
    .insert(input)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as Mailing
}

export async function atualizarMailing(id: string, input: Partial<Omit<Mailing, 'id' | 'created_at' | 'updated_at'>>) {
  await requireStaff()
  const { data, error } = await sb()
    .from('spress_imprensa_mailings')
    .update(input)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as Mailing
}

export async function deletarMailing(id: string) {
  await requireStaff()
  const { error } = await sb()
    .from('spress_imprensa_mailings')
    .delete()
    .eq('id', id)
  if (error) throw new Error(error.message)
}

export async function consultarMailing(filtros: {
  situacao?: string[]
  regiao?: string[]
  editoria?: string[]
  veiculo_id?: string[]
  cliente_id?: string | null
  incluidos?: string[]
  excluidos?: string[]
  busca?: string
}) {
  await requireStaff()

  let q = sb()
    .from('spress_jornalistas')
    .select(`
      id, nome, email, telefone, whatsapp, cargo, editoria, programa, regiao, situacao,
      spress_veiculos_imprensa!veiculo_id(id, nome, tipo, tier, cidade, regiao)
    `)
    .order('nome')

  if (filtros.situacao?.length) q = q.in('situacao', filtros.situacao)
  if (filtros.regiao?.length) q = q.in('regiao', filtros.regiao)
  if (filtros.editoria?.length) {
    const like = filtros.editoria.map(e => `editoria.ilike.%${e}%`).join(',')
    q = q.or(like)
  }
  if (filtros.veiculo_id?.length) q = q.in('veiculo_id', filtros.veiculo_id)
  if (filtros.busca) q = q.or(`nome.ilike.%${filtros.busca}%,email.ilike.%${filtros.busca}%`)

  const { data, error } = await q
  if (error) throw new Error(error.message)

  let rows = data ?? []

  if (filtros.incluidos?.length) {
    const extra = rows.filter((r: { id: string }) => filtros.incluidos!.includes(r.id))
    const baseIds = new Set(rows.map((r: { id: string }) => r.id))
    const novoIncluidos = (filtros.incluidos ?? [])
      .filter(id => !baseIds.has(id))
    if (novoIncluidos.length) {
      const { data: extras } = await sb()
        .from('spress_jornalistas')
        .select(`id, nome, email, telefone, whatsapp, cargo, editoria, programa, regiao, situacao, spress_veiculos_imprensa!veiculo_id(id, nome, tipo, tier, cidade, regiao)`)
        .in('id', novoIncluidos)
      rows = [...rows, ...(extras ?? [])]
    }
    void extra
  }

  if (filtros.excluidos?.length) {
    rows = rows.filter((r: { id: string }) => !filtros.excluidos!.includes(r.id))
  }

  return rows
}

export async function registrarExportacao(input: {
  mailing_id?: string
  filtros: Record<string, unknown>
  campos: string[]
  formato: 'csv' | 'xlsx' | 'emails_txt' | 'vcf'
  qtd_registros: number
  exportado_por?: string
}) {
  await requireStaff()
  const { error } = await sb()
    .from('spress_imprensa_mailing_exportacoes')
    .insert(input)
  if (error) throw new Error(error.message)
}

// ── Configurações ─────────────────────────────────────────────────────

export async function getImprensaConfig() {
  await requireStaff()
  const { data, error } = await sb()
    .from('spress_imprensa_config')
    .select('*')
  if (error) throw new Error(error.message)
  return Object.fromEntries((data ?? []).map(r => [r.chave, r.valor])) as Record<string, Record<string, unknown>>
}

export async function atualizarImprensaConfig(chave: string, valor: Record<string, unknown>) {
  await requireStaff()
  const { error } = await sb()
    .from('spress_imprensa_config')
    .upsert({ chave, valor }, { onConflict: 'chave' })
  if (error) throw new Error(error.message)
}

// ── Dashboard ─────────────────────────────────────────────────────────

export async function getDashboardImprensa(mes?: string) {
  await requireStaff()

  const mesAlvo = mes ?? new Date().toISOString().substring(0, 7) + '-01'
  const mesProximo = new Date(mesAlvo)
  mesProximo.setMonth(mesProximo.getMonth() + 1)
  const mesFim = mesProximo.toISOString().substring(0, 10)

  const [clippings, metas, disparos] = await Promise.all([
    sb()
      .from('spress_clipping')
      .select('id, cliente_id, formato, data_publicacao', { count: 'exact' })
      .gte('data_publicacao', mesAlvo)
      .lt('data_publicacao', mesFim),
    sb()
      .from('spress_v_cliente_meta_mes')
      .select('*')
      .eq('mes', mesAlvo),
    sb()
      .from('spress_pautas_veiculos')
      .select('id, status', { count: 'exact' })
      .gte('created_at', mesAlvo)
      .lt('created_at', mesFim),
  ])

  if (clippings.error) throw new Error(clippings.error.message)
  if (disparos.error) throw new Error(disparos.error.message)

  const totalClippings = clippings.count ?? 0
  const totalDisparos = disparos.count ?? 0
  const totalPublicados = (disparos.data ?? []).filter(d => d.status === 'publicado').length
  const taxaPublicacao = totalDisparos > 0 ? totalPublicados / totalDisparos : 0

  return {
    mes: mesAlvo,
    totalClippings,
    totalDisparos,
    totalPublicados,
    taxaPublicacao,
    metas: metas.data as ClienteMetaMes[] ?? [],
  }
}

// ── Alertas ───────────────────────────────────────────────────────────

export async function getAlertasJornalistas() {
  await requireStaff()

  const config = await getImprensaConfig()
  const cfg = config['alerta_jornalista'] ?? {}
  const limiteEnvios = Number(cfg['envios_seguidos_sem_resposta'] ?? 3)
  const taxaMin = Number(cfg['taxa_publicacao_min'] ?? 0.1)

  const { data, error } = await sb()
    .from('spress_v_jornalista_metricas')
    .select('*')
    .eq('situacao', 'ativo')
  if (error) throw new Error(error.message)

  const alertas = (data as JornalistaMetrica[]).filter(j =>
    j.envios_seguidos_sem_resposta >= limiteEnvios ||
    (j.envios >= 3 && j.taxa_publicacao < taxaMin)
  ).map(j => ({
    ...j,
    motivo: j.envios_seguidos_sem_resposta >= limiteEnvios
      ? `${j.envios_seguidos_sem_resposta} envios consecutivos sem resposta`
      : `Taxa de publicação baixa (${(j.taxa_publicacao * 100).toFixed(0)}%)`,
  }))

  return alertas
}

export async function getAlertasClientes() {
  await requireStaff()

  const mes = new Date().toISOString().substring(0, 7) + '-01'
  const { data, error } = await sb()
    .from('spress_v_cliente_meta_mes')
    .select('*')
    .eq('mes', mes)
  if (error) throw new Error(error.message)

  const config = await getImprensaConfig()
  const diaAlerta = Number(config['alerta_cliente']?.['dia_inicio_alerta'] ?? 15)
  const diaAtual = new Date().getDate()

  if (diaAtual < diaAlerta) return []

  return (data as ClienteMetaMes[]).filter(c => c.meta > 0 && c.ritmo_esperado > c.realizado)
}
