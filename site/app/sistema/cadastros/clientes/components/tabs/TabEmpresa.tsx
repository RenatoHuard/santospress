'use client'

import { useRouter } from 'next/navigation'
import { useTransition, useState } from 'react'
import {
  criarCliente,
  atualizarCliente,
  type ClientePayload,
} from '../../../../actions/clientes'
import {
  Section, Field, G2, G3, SaveBtn, Feedback, inputCls, ESTADOS_BR, MaskedInput,
} from '../../../funcionarios/components/tabs/_shared'
import {
  maskCEP, maskTelefone, maskCNPJ,
  validateCEP, validateTelefone, validateEmail, validateCNPJ,
} from '../../../funcionarios/components/tabs/_masks'

const SEGMENTOS = [
  'Agência de Publicidade',
  'Alimentação e Bebidas',
  'Automotivo',
  'Construção Civil',
  'Educação',
  'Farmácia e Saúde',
  'Imobiliário',
  'Indústria',
  'Moda e Vestuário',
  'Serviços',
  'Tecnologia',
  'Varejo',
  'Outro',
]

const STATUS_OPTIONS = ['ativo', 'inativo', 'suspenso']

interface Props {
  mode: 'create' | 'edit'
  initialData?: Record<string, string>
}

function blank(v: string | undefined | null) {
  return v ?? ''
}

export function TabEmpresa({ mode, initialData }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Campos de acesso — somente na criação
  const [senha, setSenha] = useState('')
  const [confirmaSenha, setConfirmaSenha] = useState('')

  const [form, setForm] = useState<ClientePayload>({
    razao_social:         blank(initialData?.razao_social),
    nome_fantasia:        blank(initialData?.nome_fantasia),
    cnpj:                 blank(initialData?.cnpj),
    inscricao_estadual:   blank(initialData?.inscricao_estadual),
    inscricao_municipal:  blank(initialData?.inscricao_municipal),
    segmento:             blank(initialData?.segmento),
    cep:                  blank(initialData?.cep),
    logradouro:           blank(initialData?.logradouro),
    numero:               blank(initialData?.numero),
    complemento:          blank(initialData?.complemento),
    bairro:               blank(initialData?.bairro),
    cidade:               blank(initialData?.cidade),
    uf:                   blank(initialData?.uf),
    telefone:             blank(initialData?.telefone),
    email:                blank(initialData?.email),
    site_url:             blank(initialData?.site_url),
    status:               blank(initialData?.status) || 'ativo',
    observacoes:          blank(initialData?.observacoes),
  })

  function set(key: keyof ClientePayload, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setSuccess(false)
  }

  async function buscaCEP() {
    const cep = form.cep.replace(/\D/g, '')
    if (cep.length !== 8) return
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
      const data = await res.json()
      if (!data.erro) {
        setForm((prev) => ({
          ...prev,
          logradouro: data.logradouro ?? prev.logradouro,
          bairro:     data.bairro     ?? prev.bairro,
          cidade:     data.localidade ?? prev.cidade,
          uf:         data.uf         ?? prev.uf,
        }))
      }
    } catch {
      // ignore
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (mode === 'create') {
      if (!form.email) { setError('E-mail é obrigatório para criar o acesso ao portal.'); return }
      if (senha.length < 8) { setError('A senha deve ter no mínimo 8 caracteres.'); return }
      if (senha !== confirmaSenha) { setError('As senhas não conferem.'); return }
    }

    startTransition(async () => {
      try {
        if (mode === 'create') {
          const id = await criarCliente({ ...form, senha })
          router.push(`/sistema/cadastros/clientes/${id}`)
        } else {
          await atualizarCliente(initialData!.id, form)
          setSuccess(true)
          setTimeout(() => setSuccess(false), 3000)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao salvar')
      }
    })
  }

  const inp = (key: keyof ClientePayload, placeholder?: string, type = 'text') => (
    <input
      type={type}
      value={form[key]}
      onChange={(e) => set(key, e.target.value)}
      placeholder={placeholder}
      className={inputCls}
    />
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Dados da Empresa */}
      <Section title="Dados da Empresa">
        <G2>
          <Field label="Razão Social">
            {inp('razao_social', 'Nome jurídico completo')}
          </Field>
          <Field label="Nome Fantasia">
            {inp('nome_fantasia', 'Como é conhecido no mercado')}
          </Field>
        </G2>
        <G3>
          <Field label="CNPJ">
            <MaskedInput
              value={form.cnpj}
              onChange={(v) => set('cnpj', v)}
              mask={maskCNPJ}
              validate={validateCNPJ}
              placeholder="00.000.000/0000-00"
            />
          </Field>
          <Field label="Inscrição Estadual">
            {inp('inscricao_estadual', 'IE')}
          </Field>
          <Field label="Inscrição Municipal">
            {inp('inscricao_municipal', 'IM')}
          </Field>
        </G3>
        <G2>
          <Field label="Segmento">
            <select
              value={form.segmento}
              onChange={(e) => set('segmento', e.target.value)}
              className={inputCls}
            >
              <option value="">Selecione o segmento</option>
              {SEGMENTOS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            <select
              value={form.status}
              onChange={(e) => set('status', e.target.value)}
              className={inputCls}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </Field>
        </G2>
      </Section>

      {/* Endereço */}
      <Section title="Endereço">
        <G3>
          <Field label="CEP">
            <MaskedInput
              value={form.cep}
              onChange={(v) => set('cep', v)}
              mask={maskCEP}
              validate={validateCEP}
              placeholder="00000-000"
              onBlurExtra={buscaCEP}
            />
          </Field>
          <Field label="Logradouro" full>
            {inp('logradouro', 'Rua, Avenida...')}
          </Field>
        </G3>
        <G3>
          <Field label="Número">
            {inp('numero', 'Nº')}
          </Field>
          <Field label="Complemento">
            {inp('complemento', 'Sala, Andar...')}
          </Field>
          <Field label="Bairro">
            {inp('bairro')}
          </Field>
        </G3>
        <G2>
          <Field label="Cidade">
            {inp('cidade')}
          </Field>
          <Field label="UF">
            <select
              value={form.uf}
              onChange={(e) => set('uf', e.target.value)}
              className={inputCls}
            >
              <option value="">UF</option>
              {ESTADOS_BR.map((uf) => (
                <option key={uf} value={uf}>{uf}</option>
              ))}
            </select>
          </Field>
        </G2>
      </Section>

      {/* Contato Geral */}
      <Section title="Contato Geral">
        <G3>
          <Field label="Telefone">
            <MaskedInput
              value={form.telefone}
              onChange={(v) => set('telefone', v)}
              mask={maskTelefone}
              validate={validateTelefone}
              placeholder="(00) 00000-0000"
              type="tel"
            />
          </Field>
          <Field label="E-mail" full>
            <MaskedInput
              value={form.email}
              onChange={(v) => set('email', v)}
              validate={validateEmail}
              placeholder="contato@empresa.com.br"
              type="email"
            />
          </Field>
        </G3>
        <Field label="Site">
          {inp('site_url', 'https://empresa.com.br', 'url')}
        </Field>
      </Section>

      {/* Observações */}
      <Section title="Observações">
        <textarea
          value={form.observacoes}
          onChange={(e) => set('observacoes', e.target.value)}
          placeholder="Notas internas, informações adicionais..."
          rows={4}
          className={inputCls}
        />
      </Section>

      {/* Acesso ao Portal — somente na criação */}
      {mode === 'create' && (
        <Section title="Acesso ao Portal do Cliente">
          <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1 mb-3">
            O cliente usará o e-mail informado acima e esta senha para acessar o portal.
          </p>
          <G2>
            <Field label="Senha">
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className={inputCls}
                autoComplete="new-password"
              />
            </Field>
            <Field label="Confirmar Senha">
              <input
                type="password"
                value={confirmaSenha}
                onChange={(e) => setConfirmaSenha(e.target.value)}
                placeholder="Repita a senha"
                className={inputCls}
                autoComplete="new-password"
              />
            </Field>
          </G2>
        </Section>
      )}

      <div className="flex items-center gap-4">
        <SaveBtn saving={isPending} />
        <Feedback error={error} success={success} />
      </div>
    </form>
  )
}
