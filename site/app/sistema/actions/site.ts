'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

function serviceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key || key === 'sua_service_role_key_aqui') throw new Error('SERVICE_KEY_NOT_SET')
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key)
}

export type ConteudoSite = Record<string, Record<string, string>>

export async function getConteudoSite(): Promise<ConteudoSite> {
  const { data } = await serviceClient()
    .from('spress_conteudo_site')
    .select('secao, chave, valor')

  const result: ConteudoSite = {}
  for (const row of data ?? []) {
    if (!result[row.secao]) result[row.secao] = {}
    result[row.secao][row.chave] = row.valor ?? ''
  }
  return result
}

export async function salvarSecaoSite(secao: string, dados: Record<string, string>) {
  const sb = serviceClient()

  const rows = Object.entries(dados).map(([chave, valor]) => ({
    secao,
    chave,
    valor: valor || null,
  }))

  const { error } = await sb
    .from('spress_conteudo_site')
    .upsert(rows, { onConflict: 'secao,chave' })

  if (error) throw new Error(error.message)

  revalidatePath('/')
  revalidatePath('/sistema/site')
}
