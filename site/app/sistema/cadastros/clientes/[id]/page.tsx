import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCliente } from '../../../actions/clientes'
import { ClienteForm } from '../components/ClienteForm'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditarClientePage({ params }: Props) {
  const { id } = await params

  let cliente = null
  try {
    cliente = await getCliente(id)
  } catch {
    // service key not set
  }

  if (cliente === null) notFound()

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <Link
          href="/sistema/cadastros/clientes"
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-400 text-xs flex items-center gap-1.5 mb-4 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Clientes
        </Link>
        <h1 className="text-gray-900 dark:text-white text-2xl font-bold">Editar Cliente</h1>
        {cliente && (
          <p className="text-gray-500 dark:text-gray-600 text-sm mt-1">
            {(cliente as Record<string, string>).nome_fantasia ?? (cliente as Record<string, string>).razao_social}
          </p>
        )}
      </div>

      {!cliente ? (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/30 rounded-xl p-4 text-amber-700 dark:text-amber-400 text-sm">
          Configure <code className="font-mono bg-amber-100 dark:bg-black/30 px-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code> no .env.local para editar clientes.
        </div>
      ) : (
        <ClienteForm mode="edit" initialData={cliente as Record<string, string>} />
      )}
    </div>
  )
}
