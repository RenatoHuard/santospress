import Link from 'next/link'

export default function CasesRelatoriosPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-gray-900 dark:text-white text-2xl font-bold">Relatórios — Cases</h1>
          <p className="text-gray-400 dark:text-gray-600 text-sm mt-0.5">Análise de performance dos post cases</p>
        </div>
        <Link
          href="/sistema/cases/novo"
          className="bg-gold text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#9e2126] transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nova Case
        </Link>
      </div>

      <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl p-16 text-center">
        <svg className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
        <p className="text-gray-600 dark:text-gray-400 font-medium">Relatórios em breve</p>
        <p className="text-gray-400 dark:text-gray-600 text-sm mt-2">
          A área pública dos Post Cases será criada em uma próxima etapa e os relatórios de visitas estarão disponíveis então.
        </p>
      </div>
    </div>
  )
}
