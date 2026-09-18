'use client'

import { useState } from 'react'
import { TabPessoal } from '../cadastros/funcionarios/components/tabs/TabPessoal'
import { TabDocumentacao } from '../cadastros/funcionarios/components/tabs/TabDocumentacao'
import { MeuContrato } from './MeuContrato'
import { MinhaSaude } from './MinhaSaude'
import { MinhaFinanceiro } from './MinhaFinanceiro'

type TabKey = 'pessoal' | 'documentacao' | 'contrato' | 'saude' | 'financeiro'

const TABS_BASE: { key: TabKey; label: string; rhOnly: boolean }[] = [
  { key: 'pessoal',      label: 'Dados Pessoais', rhOnly: false },
  { key: 'documentacao', label: 'Documentação',   rhOnly: false },
  { key: 'contrato',     label: 'Meu Contrato',   rhOnly: true  },
  { key: 'saude',        label: 'Saúde',           rhOnly: true  },
  { key: 'financeiro',   label: 'Notas de Serviço',rhOnly: true  },
]

interface Props {
  usuarioId: string
  nome?: string
  readOnly?: boolean
  onDirty?: () => void
  /** Roles do usuário logado — controla quais abas aparecem */
  userRoles?: string[]
}

export function MeusDadosForm({ usuarioId, nome, readOnly = false, onDirty, userRoles = [] }: Props) {
  const podeVerRH = userRoles.some(r => ['admin', 'rh', 'gestor'].includes(r))
  const TABS = TABS_BASE.filter(t => !t.rhOnly || podeVerRH)
  const [active, setActive] = useState<TabKey>('pessoal')

  return (
    <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl shadow-sm dark:shadow-none overflow-hidden">

      {/* Nome — sempre visível, nunca editável aqui */}
      {nome && (
        <div className="px-6 sm:px-8 pt-6 pb-4 border-b border-gray-100 dark:border-white/5">
          <p className="text-[10px] font-semibold tracking-widest uppercase text-gray-400 dark:text-gray-500 mb-1">Nome completo</p>
          <div className="flex items-center justify-between gap-4">
            <p className="text-base font-semibold text-gray-900 dark:text-white">{nome}</p>
            <span className="text-[10px] text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/8 rounded-lg px-2.5 py-1 whitespace-nowrap">
              Alteração via RH
            </span>
          </div>
        </div>
      )}

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

      {/* Tab content — fieldset disabled bloqueia todos os controles em modo leitura */}
      <fieldset
        disabled={readOnly}
        className="block"
        onInput={!readOnly ? onDirty : undefined}
      >
        <div className="p-6 sm:p-8">
          {active === 'pessoal'      && <TabPessoal      usuarioId={usuarioId} />}
          {active === 'documentacao' && <TabDocumentacao usuarioId={usuarioId} />}
          {active === 'contrato'     && <MeuContrato     usuarioId={usuarioId} />}
          {active === 'saude'        && <MinhaSaude      usuarioId={usuarioId} />}
          {active === 'financeiro'   && <MinhaFinanceiro usuarioId={usuarioId} />}
        </div>
      </fieldset>
    </div>
  )
}
