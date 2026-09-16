'use client'

import { useState, useEffect } from 'react'
import { getFuncBancario, saveFuncBancario, getColaboradorRole } from '../../../../actions/rh'
import { supabase } from '@/lib/supabase'
import { inputCls, Section, Field, G2, TabLoader, SaveBtn, Feedback, BoolToggle } from './_shared'

const TIPOS_CONTA = [
  { value: 'corrente', label: 'Conta corrente' },
  { value: 'salario',  label: 'Conta salário' },
  { value: 'poupanca', label: 'Poupança' },
]

const EMPTY = {
  banco_nome: '', agencia: '', conta_numero: '', conta_tipo: 'corrente', chave_pix: '',
  beneficio_vt: false, beneficio_va: false, beneficio_vr: false,
  beneficio_saude: false, beneficio_odonto: false,
  beneficio_vt_valor: '', beneficio_va_valor: '', beneficio_vr_valor: '',
  beneficio_saude_valor: '', beneficio_odonto_valor: '',
}

interface Beneficio {
  key: 'vt' | 'va' | 'vr' | 'saude' | 'odonto'
  label: string
  note?: string
}

const BENEFICIOS: Beneficio[] = [
  { key: 'vt',    label: 'Vale-Transporte (VT)',  note: 'Desconto proporcional de 6% do salário' },
  { key: 'va',    label: 'Vale-Alimentação (VA)' },
  { key: 'vr',    label: 'Vale-Refeição (VR)' },
  { key: 'saude', label: 'Plano de Saúde' },
  { key: 'odonto',label: 'Plano Odontológico' },
]

export function TabFinanceiro({ usuarioId }: { usuarioId: string }) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [canSeeValues, setCanSeeValues] = useState(false)

  useEffect(() => {
    const load = async () => {
      const [data, { data: { user } }] = await Promise.all([
        getFuncBancario(usuarioId),
        supabase.auth.getUser(),
      ])
      if (data) {
        setForm({
          banco_nome:    data.banco_nome ?? '',
          agencia:       data.agencia ?? '',
          conta_numero:  data.conta_numero ?? '',
          conta_tipo:    data.conta_tipo ?? 'corrente',
          chave_pix:     data.chave_pix ?? '',
          beneficio_vt:  data.beneficio_vt ?? false,
          beneficio_va:  data.beneficio_va ?? false,
          beneficio_vr:  data.beneficio_vr ?? false,
          beneficio_saude:  data.beneficio_saude ?? false,
          beneficio_odonto: data.beneficio_odonto ?? false,
          beneficio_vt_valor:     data.beneficio_vt_valor?.toString() ?? '',
          beneficio_va_valor:     data.beneficio_va_valor?.toString() ?? '',
          beneficio_vr_valor:     data.beneficio_vr_valor?.toString() ?? '',
          beneficio_saude_valor:  data.beneficio_saude_valor?.toString() ?? '',
          beneficio_odonto_valor: data.beneficio_odonto_valor?.toString() ?? '',
        })
      }
      if (user) {
        const perfil = await getColaboradorRole(user.id)
        setCanSeeValues(perfil?.role === 'admin' || perfil?.acesso_financeiro === true)
      }
      setLoading(false)
    }
    load()
  }, [usuarioId])

  function setStr(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }
  function setBool(field: string, value: boolean) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)
    try {
      await saveFuncBancario(usuarioId, {
        ...form,
        beneficio_vt_valor:     form.beneficio_vt_valor     ? parseFloat(form.beneficio_vt_valor)     : null,
        beneficio_va_valor:     form.beneficio_va_valor     ? parseFloat(form.beneficio_va_valor)     : null,
        beneficio_vr_valor:     form.beneficio_vr_valor     ? parseFloat(form.beneficio_vr_valor)     : null,
        beneficio_saude_valor:  form.beneficio_saude_valor  ? parseFloat(form.beneficio_saude_valor)  : null,
        beneficio_odonto_valor: form.beneficio_odonto_valor ? parseFloat(form.beneficio_odonto_valor) : null,
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
      <Section title="Dados Bancários">
        <G2>
          <Field label="Banco">
            <input type="text" className={inputCls} placeholder="Ex.: Caixa Econômica Federal"
              value={form.banco_nome} onChange={(e) => setStr('banco_nome', e.target.value)} />
          </Field>
          <Field label="Tipo de conta">
            <select className={inputCls} value={form.conta_tipo}
              onChange={(e) => setStr('conta_tipo', e.target.value)}>
              {TIPOS_CONTA.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Agência">
            <input type="text" className={inputCls} placeholder="0000"
              value={form.agencia} onChange={(e) => setStr('agencia', e.target.value)} />
          </Field>
          <Field label="Número da conta">
            <input type="text" className={inputCls} placeholder="00000-0"
              value={form.conta_numero} onChange={(e) => setStr('conta_numero', e.target.value)} />
          </Field>
          <Field label="Chave Pix" note="CPF, e-mail, telefone ou chave aleatória">
            <input type="text" className={inputCls} placeholder="CPF, e-mail ou telefone"
              value={form.chave_pix} onChange={(e) => setStr('chave_pix', e.target.value)} />
          </Field>
        </G2>
      </Section>

      <Section title="Benefícios Ativos">
        <div className="space-y-4">
          {BENEFICIOS.map((b, i) => {
            const ativoKey  = `beneficio_${b.key}` as keyof typeof form
            const valorKey  = `beneficio_${b.key}_valor` as keyof typeof form
            const isAtivo   = form[ativoKey] as boolean
            return (
              <div key={b.key}>
                {i > 0 && <div className="border-t border-gray-100 dark:border-white/5 mb-4" />}
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <BoolToggle
                      label={b.label}
                      note={b.note}
                      checked={isAtivo}
                      onChange={(v) => setBool(ativoKey, v)}
                    />
                  </div>
                  {canSeeValues && isAtivo && (
                    <div className="w-36 shrink-0">
                      <label className="block text-xs text-gray-400 dark:text-gray-500 mb-1.5">
                        Valor (R$/mês)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0,00"
                        className={inputCls}
                        value={form[valorKey] as string}
                        onChange={(e) => setStr(valorKey, e.target.value)}
                      />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </Section>

      <Feedback error={error} success={success} />
      <SaveBtn saving={saving} />
    </form>
  )
}
