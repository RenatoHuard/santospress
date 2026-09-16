import Link from 'next/link'
import { ClienteForm } from '../components/ClienteForm'

export default function NovoClientePage() {
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
        <h1 className="text-gray-900 dark:text-white text-2xl font-bold">Novo Cliente</h1>
        <p className="text-gray-500 dark:text-gray-600 text-sm mt-1">
          Preencha os dados da empresa. As demais abas ficam disponíveis após o cadastro.
        </p>
      </div>
      <ClienteForm mode="create" />
    </div>
  )
}
