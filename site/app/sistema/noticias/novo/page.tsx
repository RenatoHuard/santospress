import { getFuncionariosBasico, getClientesBasico } from '@/app/sistema/actions/blog'
import { BlogEditorClient } from '@/app/sistema/blog/novo/BlogEditorClient'

export default async function NovaNoticiaPage() {
  const [funcionarios, clientes] = await Promise.all([
    getFuncionariosBasico(),
    getClientesBasico(),
  ])
  return (
    <BlogEditorClient
      funcionarios={funcionarios}
      clientes={clientes}
      tipo="noticia"
      tipoLabel="Notícia"
      backHref="/sistema/noticias"
    />
  )
}
