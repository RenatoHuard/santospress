'use client'

import { useState } from 'react'
import { TabPessoal } from '../cadastros/funcionarios/components/tabs/TabPessoal'
import { TabDocumentacao } from '../cadastros/funcionarios/components/tabs/TabDocumentacao'
import { MeuContrato } from './MeuContrato'
import { MinhaSaude } from './MinhaSaude'
import { MinhaFinanceiro } from './MinhaFinanceiro'

type TabKey = 'pessoal' | 'documentacao' | 'contrato' | 'saude' | 'financeiro'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'pessoal',      label: 'Dados Pessoais' },
  { key: 'documentacao', label: 'Documentação' },
  { key: 'contrato',     label: 'Meu Contrato' },
  { key: 'saude',        label: 'Saúde' },
  { key: 'financeiro',   label: 'Notas de Serviço' },
]

export function MeusDadosForm({ usuarioId }: { usuarioId: string }) {
  const [active, setActive] = useState<TabKey>('pessoal')

  return (
    <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl shadow-sm dark:shadow-none overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-gray-100 dark:border-white/5 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActive(tab.key)}
            className={`px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              active === tab.key
                ? 'border-gold text-gold'
                : 'border-transparent text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-6 sm:p-8">
        {active === 'pessoal'      && <TabPessoal      usuarioId={usuarioId} />}
        {active === 'documentacao' && <TabDocumentacao usuarioId={usuarioId} />}
        {active === 'contrato'     && <MeuContrato     usuarioId={usuarioId} />}
        {active === 'saude'        && <MinhaSaude      usuarioId={usuarioId} />}
        {active === 'financeiro'   && <MinhaFinanceiro usuarioId={usuarioId} />}
      </div>
    </div>
  )
}
