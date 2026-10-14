import { notFound } from 'next/navigation'
import { getCliente, getClientes } from '../../../actions/clientes'
import { ClienteDetailView } from './ClienteDetailView'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ClientePage({ params }: Props) {
  const { id } = await params

  let cliente = null
  let todos: { id: string; razao_social: string | null; nome_fantasia: string | null }[] = []
  try {
    ;[cliente, todos] = await Promise.all([getCliente(id), getClientes()])
  } catch {
    // service key not set
  }

  if (cliente === null) notFound()

  return (
    <ClienteDetailView
      key={id}
      cliente={cliente as Record<string, string>}
      todos={todos as { id: string; razao_social: string | null; nome_fantasia: string | null }[]}
    />
  )
}
