export interface BlogPost {
  id: string
  titulo: string
  slug: string
  resumo: string | null
  capa_url: string | null
  publicado_em: string | null
  conteudo?: string | null
  autor?: { nome: string } | null
}

export interface TeamMember {
  id: string
  nome: string
  nome_site: string | null
  cargo: string | null
  foto_url: string | null
  descricao_site: string | null
}
