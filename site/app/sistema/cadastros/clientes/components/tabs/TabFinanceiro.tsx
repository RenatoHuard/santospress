'use client'

import { useCallback, useEffect, useState, useTransition } from 'react'
import {
  getClienteFinanceiro,
  salvarClienteFinanceiro,
  type FinanceiroPayload,
} from '../../../../actions/clientes'
import {
  Section, Field, G2, G3, SaveBtn, Feedback, TabLoader, inputCls, MaskedInput,
} from '../../../funcionarios/components/tabs/_shared'
import { validateEmail } from '../../../funcionarios/components/tabs/_masks'

const TIPOS_CONTA = ['Corrente', 'Poupança', 'Pagamento']

function blank(v: string | undefined | null) { return v ?? '' }

interface Props { clienteId: string }

export function TabFinanceiro({ clienteId }: Props) {
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState<FinanceiroPayload>({
    email_financeiro: '',
    banco:            '',
    agencia:          '',
    conta:            '',
    tipo_conta:       '',
    pix:              '',
    observacoes:      '',
  })

  const load = useCallback(async () => {
    setLoading(true)
    const data = await getClienteFinanceiro(clienteId) as Record<string, string> | null
    if (data) {
      setForm({
        email_financeiro: blank(data.email_financeiro),
        banco:            blank(data.banco),
        agencia:          blank(data.agencia),
        conta:            blank(data.conta),
        tipo_conta:       blank(data.tipo_conta),
        pix:              blank(data.pix),
        observacoes:      blank(data.observacoes),
      })
    }
    setLoading(false)
  }, [clienteId])

  useEffect(() => { load() }, [load])

  function set(key: keyof FinanceiroPayload, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setSuccess(false)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      try {
        await salvarClienteFinanceiro(clienteId, form)
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao salvar')
      }
    })
  }

  const inp = (key: keyof FinanceiroPayload, placeholder?: string, type = 'text') => (
    <input
      type={type}
      value={form[key]}
      onChange={(e) => set(key, e.target.value)}
      placeholder={placeholder}
      className={inputCls}
    />
  )

  if (loading) return <TabLoader />

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Section title="Contato Financeiro">
        <Field label="E-mail Financeiro">
          <MaskedInput
            value={form.email_financeiro}
            onChange={(v) => set('email_financeiro', v)}
            validate={validateEmail}
            placeholder="financeiro@empresa.com.br"
            type="email"
          />
        </Field>
      </Section>

      <Section title="Dados Bancários">
        <G3>
          <Field label="Banco">
            {inp('banco', 'Ex: Bradesco, Itaú...')}
          </Field>
          <Field label="Agência">
            {inp('agencia', '0000-0')}
          </Field>
          <Field label="Conta">
            {inp('conta', '00000-0')}
          </Field>
        </G3>
        <G2>
          <Field label="Tipo de Conta">
            <select
              value={form.tipo_conta}
              onChange={(e) => set('tipo_conta', e.target.value)}
              className={inputCls}
            >
              <option value="">Selecione</option>
              {TIPOS_CONTA.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="Chave PIX">
            {inp('pix', 'CNPJ, e-mail ou telefone')}
          </Field>
        </G2>
      </Section>

      <Section title="Observações">
        <textarea
          value={form.observacoes}
          onChange={(e) => set('observacoes', e.target.value)}
          placeholder="Condições de pagamento, prazo, notas..."
          rows={3}
          className={inputCls}
        />
      </Section>

      <div className="flex items-center gap-4">
        <SaveBtn saving={isPending} />
        <Feedback error={error} success={success} />
      </div>
    </form>
  )
}
