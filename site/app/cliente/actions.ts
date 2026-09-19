'use server'

import { createClient } from '@supabase/supabase-js'

function sb() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key || key === 'sua_service_role_key_aqui') throw new Error('SERVICE_KEY_NOT_SET')
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key)
}

export interface Contato {
  id: string
  nome: string
  cargo: string | null
  cargo_equipe: string | null
  email: string | null
  foto_url: string | null
  tipo: 'atendente' | 'lider'
}

export interface ClienteDashboard {
  id: string
  nome: string
  razao_social: string | null
  status: string
  created_at: string
  metricas: {
    atendidas: number
    emAndamento: number
  }
  contatos: Contato[]
}

export async function getClienteDashboard(authUserId: string): Promise<ClienteDashboard | null> {
  const client = sb()

  const { data: cli } = await client
    .from('spress_clientes')
    .select('id, nome_fantasia, razao_social, status, created_at, atendente_id, equipe_id')
    .eq('auth_user_id', authUserId)
    .maybeSingle()

  if (!cli) return null

  const [{ count: atendidas }, { count: emAndamento }, atendenteRes, lideresRes] =
    await Promise.all([
      client
        .from('spress_demandas')
        .select('*', { count: 'exact', head: true })
        .eq('cliente_id', cli.id)
        .not('concluida_em', 'is', null),
      client
        .from('spress_demandas')
        .select('*', { count: 'exact', head: true })
        .eq('cliente_id', cli.id)
        .is('concluida_em', null),
      cli.atendente_id
        ? client
            .from('spress_usuarios')
            .select('id, nome, cargo, email, foto_url')
            .eq('id', cli.atendente_id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      cli.equipe_id
        ? client
            .from('spress_equipe_membros')
            .select('cargo_equipe, spress_usuarios(id, nome, cargo, email, foto_url)')
            .eq('equipe_id', cli.equipe_id)
            .is('parent_id', null)
        : Promise.resolve({ data: [] }),
    ])

  const contatos: Contato[] = []

  if (atendenteRes.data) {
    const a = atendenteRes.data as { id: string; nome: string; cargo: string | null; email: string | null; foto_url: string | null }
    contatos.push({ ...a, cargo_equipe: null, tipo: 'atendente' })
  }

  for (const m of (lideresRes.data ?? []) as unknown as { cargo_equipe: string | null; spress_usuarios: { id: string; nome: string; cargo: string | null; email: string | null; foto_url: string | null } }[]) {
    if (!m.spress_usuarios) continue
    if (contatos.find(c => c.id === m.spress_usuarios.id)) continue
    contatos.push({ ...m.spress_usuarios, cargo_equipe: m.cargo_equipe, tipo: 'lider' })
  }

  return {
    id: cli.id,
    nome: cli.nome_fantasia || cli.razao_social || 'Cliente',
    razao_social: cli.razao_social,
    status: cli.status,
    created_at: cli.created_at,
    metricas: { atendidas: atendidas ?? 0, emAndamento: emAndamento ?? 0 },
    contatos,
  }
}

export interface ClienteCadastro {
  razao_social: string
  nome_fantasia: string | null
  cnpj: string | null
  segmento: string | null
  telefone: string | null
  email: string | null
  cidade: string | null
  uf: string | null
  site_url: string | null
  cep: string | null
  logradouro: string | null
  numero: string | null
  complemento: string | null
  bairro: string | null
}

export async function getClienteCadastro(authUserId: string): Promise<ClienteCadastro | null> {
  const { data } = await sb()
    .from('spress_clientes')
    .select('razao_social, nome_fantasia, cnpj, segmento, telefone, email, cidade, uf, site_url, cep, logradouro, numero, complemento, bairro')
    .eq('auth_user_id', authUserId)
    .maybeSingle()
  return data ?? null
}

export async function salvarClienteCadastro(
  authUserId: string,
  dados: Partial<ClienteCadastro>,
): Promise<{ sucesso: boolean; erro?: string }> {
  const { error } = await sb()
    .from('spress_clientes')
    .update({ ...dados, updated_at: new Date().toISOString() })
    .eq('auth_user_id', authUserId)
  if (error) return { sucesso: false, erro: error.message }
  return { sucesso: true }
}

export async function criarDemandaCliente(
  authUserId: string,
  dados: { titulo: string; descricao: string; tipo: string; prioridade: string },
): Promise<{ sucesso: boolean; erro?: string }> {
  const client = sb()

  const { data: cli } = await client
    .from('spress_clientes')
    .select('id, atendente_id')
    .eq('auth_user_id', authUserId)
    .maybeSingle()

  if (!cli) return { sucesso: false, erro: 'Cliente não encontrado.' }

  // Usa o primeiro quadro disponível, ou cria uma demanda sem quadro
  const { data: quadro } = await client
    .from('spress_quadros')
    .select('id')
    .limit(1)
    .maybeSingle()

  const { data: coluna } = quadro
    ? await client
        .from('spress_colunas')
        .select('id')
        .eq('quadro_id', quadro.id)
        .order('ordem')
        .limit(1)
        .maybeSingle()
    : { data: null }

  if (!quadro || !coluna) return { sucesso: false, erro: 'Nenhum quadro de trabalho configurado. Contate o atendimento.' }

  const { error } = await client.from('spress_demandas').insert({
    quadro_id: quadro.id,
    coluna_id: coluna.id,
    titulo: dados.titulo,
    descricao: dados.descricao,
    tipo: dados.tipo,
    prioridade: dados.prioridade,
    cliente_id: cli.id,
    atendente_id: cli.atendente_id ?? null,
    origem: 'portal_cliente',
    ordem: 0,
  })

  if (error) return { sucesso: false, erro: error.message }
  return { sucesso: true }
}
