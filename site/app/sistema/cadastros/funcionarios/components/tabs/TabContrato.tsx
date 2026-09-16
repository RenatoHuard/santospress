'use client'

import { useState, useEffect } from 'react'
import { getFuncContrato, saveFuncContrato, getFuncionariosSimples } from '../../../../actions/rh'
import { inputCls, Section, Field, G2, G3, TabLoader, SaveBtn, Feedback } from './_shared'

const TIPOS_CONTRATO = [
  { value: 'clt',        label: 'CLT' },
  { value: 'estagio',    label: 'Estágio' },
  { value: 'temporario', label: 'Temporário' },
  { value: 'pj',        label: 'PJ / Prestador de Serviços' },
  { value: 'freelancer', label: 'Freelancer' },
]

const EMPTY = {
  data_admissao: '', contrato_tipo: 'clt', jornada_escala: '', jornada_horario: '',
  departamento: '', centro_custo: '', gestor_id: '', local_trabalho: '',
  salario_base: '', adicional_insalubridade: '', adicional_periculosidade: '',
  comissao_percentual: '', observacoes_remuneracao: '',
}

interface Gestor {
  id: string
  nome: string
}

export function TabContrato({ usuarioId }: { usuarioId: string }) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [gestores, setGestores] = useState<Gestor[]>([])

  useEffect(() => {
    Promise.all([getFuncContrato(usuarioId), getFuncionariosSimples()]).then(
      ([data, funcionarios]) => {
        if (data) {
          setForm({
            data_admissao: data.data_admissao ?? '',
            contrato_tipo: data.contrato_tipo ?? 'clt',
            jornada_escala: data.jornada_escala ?? '',
            jornada_horario: data.jornada_horario ?? '',
            departamento: data.departamento ?? '',
            centro_custo: data.centro_custo ?? '',
            gestor_id: data.gestor_id ?? '',
            local_trabalho: data.local_trabalho ?? '',
            salario_base: data.salario_base?.toString() ?? '',
            adicional_insalubridade: data.adicional_insalubridade?.toString() ?? '',
            adicional_periculosidade: data.adicional_periculosidade?.toString() ?? '',
            comissao_percentual: data.comissao_percentual?.toString() ?? '',
            observacoes_remuneracao: data.observacoes_remuneracao ?? '',
          })
        }
        setGestores(funcionarios)
        setLoading(false)
      }
    )
  }, [usuarioId])

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)
    try {
      await saveFuncContrato(usuarioId, {
        ...form,
        salario_base: form.salario_base ? parseFloat(form.salario_base) : null,
        adicional_insalubridade: form.adicional_insalubridade ? parseFloat(form.adicional_insalubridade) : null,
        adicional_periculosidade: form.adicional_periculosidade ? parseFloat(form.adicional_periculosidade) : null,
        comissao_percentual: form.comissao_percentual ? parseFloat(form.comissao_percentual) : null,
      })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <TabLoader />

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Section title="Vínculo Empregatício">
        <G2>
          <Field label="Data de admissão">
            <input type="date" className={inputCls}
              value={form.data_admissao} onChange={(e) => set('data_admissao', e.target.value)} />
          </Field>
          <Field label="Tipo de contrato">
            <select className={inputCls} value={form.contrato_tipo}
              onChange={(e) => set('contrato_tipo', e.target.value)}>
              {TIPOS_CONTRATO.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Escala de trabalho">
            <input type="text" className={inputCls} placeholder="Ex.: 5×2, 12×36, 6×1"
              value={form.jornada_escala} onChange={(e) => set('jornada_escala', e.target.value)} />
          </Field>
          <Field label="Horário">
            <input type="text" className={inputCls} placeholder="Ex.: 08h00 às 17h00"
              value={form.jornada_horario} onChange={(e) => set('jornada_horario', e.target.value)} />
          </Field>
        </G2>
      </Section>

      <Section title="Cargo e Lotação">
        <G2>
          <Field label="Departamento">
            <input type="text" className={inputCls} placeholder="Ex.: Assessoria de Imprensa"
              value={form.departamento} onChange={(e) => set('departamento', e.target.value)} />
          </Field>
          <Field label="Centro de custo">
            <input type="text" className={inputCls} placeholder="Ex.: CC-001"
              value={form.centro_custo} onChange={(e) => set('centro_custo', e.target.value)} />
          </Field>
          <Field label="Gestor responsável">
            <select className={inputCls} value={form.gestor_id}
              onChange={(e) => set('gestor_id', e.target.value)}>
              <option value="">Nenhum</option>
              {gestores.map((g) => (
                <option key={g.id} value={g.id}>{g.nome}</option>
              ))}
            </select>
          </Field>
          <Field label="Local de trabalho">
            <input type="text" className={inputCls} placeholder="Ex.: Matriz Santos"
              value={form.local_trabalho} onChange={(e) => set('local_trabalho', e.target.value)} />
          </Field>
        </G2>
      </Section>

      <Section title="Remuneração">
        <G3>
          <Field label="Salário base (R$)">
            <input type="number" min="0" step="0.01" className={inputCls} placeholder="0,00"
              value={form.salario_base} onChange={(e) => set('salario_base', e.target.value)} />
          </Field>
          <Field label="Adicional insalubridade (R$)">
            <input type="number" min="0" step="0.01" className={inputCls} placeholder="0,00"
              value={form.adicional_insalubridade}
              onChange={(e) => set('adicional_insalubridade', e.target.value)} />
          </Field>
          <Field label="Adicional periculosidade (R$)">
            <input type="number" min="0" step="0.01" className={inputCls} placeholder="0,00"
              value={form.adicional_periculosidade}
              onChange={(e) => set('adicional_periculosidade', e.target.value)} />
          </Field>
          <Field label="Comissão (%)">
            <input type="number" min="0" max="100" step="0.01" className={inputCls} placeholder="0"
              value={form.comissao_percentual}
              onChange={(e) => set('comissao_percentual', e.target.value)} />
          </Field>
        </G3>
        <Field label="Observações sobre remuneração">
          <textarea rows={3} className={`${inputCls} resize-none leading-relaxed`}
            placeholder="Bônus, acordos específicos, histórico de reajustes..."
            value={form.observacoes_remuneracao}
            onChange={(e) => set('observacoes_remuneracao', e.target.value)} />
        </Field>
      </Section>

      <Feedback error={error} success={success} />
      <SaveBtn saving={saving} />
    </form>
  )
}
