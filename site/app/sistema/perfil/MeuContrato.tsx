'use client'

import { useEffect, useState } from 'react'
import { getFuncContrato } from '../actions/rh'

const TIPOS: Record<string, string> = {
  clt: 'CLT', estagio: 'Estágio', temporario: 'Temporário', pj: 'PJ / Prestador',
}

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null
  return (
    <div>
      <dt className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{label}</dt>
      <dd className="text-sm text-gray-900 dark:text-white">{value}</dd>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-wider mb-4">
        {title}
      </h3>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
        {children}
      </dl>
    </div>
  )
}

export function MeuContrato({ usuarioId }: { usuarioId: string }) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<Record<string, unknown> | null>(null)

  useEffect(() => {
    getFuncContrato(usuarioId).then((d) => {
      setData(d as Record<string, unknown> | null)
      setLoading(false)
    })
  }, [usuarioId])

  if (loading) {
    return <div className="flex justify-center py-12">
      <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
    </div>
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-gray-400 dark:text-gray-600 text-sm">
        Nenhuma informação de contrato cadastrada ainda.
      </div>
    )
  }

  const salario = data.salario_base as number | null
  const insalub = data.adicional_insalubridade as number | null
  const perig   = data.adicional_periculosidade as number | null
  const comissao = data.comissao_percentual as number | null

  return (
    <div className="space-y-8">
      <Section title="Vínculo Empregatício">
        <InfoRow label="Data de admissão"  value={data.data_admissao as string} />
        <InfoRow label="Tipo de contrato"  value={TIPOS[data.contrato_tipo as string] ?? (data.contrato_tipo as string)} />
        <InfoRow label="Escala de trabalho" value={data.jornada_escala as string} />
        <InfoRow label="Horário"            value={data.jornada_horario as string} />
      </Section>

      <div className="border-t border-gray-100 dark:border-white/5" />

      <Section title="Cargo e Lotação">
        <InfoRow label="Departamento"     value={data.departamento as string} />
        <InfoRow label="Centro de custo"  value={data.centro_custo as string} />
        <InfoRow label="Local de trabalho" value={data.local_trabalho as string} />
      </Section>

      {!!(salario || insalub || perig || comissao || data.observacoes_remuneracao) && (
        <>
          <div className="border-t border-gray-100 dark:border-white/5" />
          <Section title="Remuneração">
            {salario  != null && <InfoRow label="Salário base"               value={`R$ ${salario.toFixed(2)}`} />}
            {insalub  != null && insalub > 0 && <InfoRow label="Adicional insalubridade"  value={`R$ ${insalub.toFixed(2)}`} />}
            {perig    != null && perig > 0   && <InfoRow label="Adicional periculosidade" value={`R$ ${perig.toFixed(2)}`} />}
            {comissao != null && comissao > 0 && <InfoRow label="Comissão"                value={`${comissao}%`} />}
          </Section>
          {!!(data.observacoes_remuneracao) && (
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Observações</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {data.observacoes_remuneracao as string}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
