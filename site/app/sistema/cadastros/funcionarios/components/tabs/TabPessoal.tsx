'use client'

import { useState, useEffect } from 'react'
import { getFuncPessoal, saveFuncPessoal } from '../../../../actions/rh'
import { inputCls, Section, Field, G2, TabLoader, SaveBtn, Feedback, ESTADOS_BR, MaskedInput } from './_shared'
import { maskCPF, maskCEP, maskTelefone, validateCPF, validateCEP, validateTelefone, validateEmail } from './_masks'

const GENEROS = ['Masculino', 'Feminino', 'Não-binário', 'Prefiro não informar']
const ESTADOS_CIVIS = ['Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)', 'União estável']

const TAMANHOS_CAMISETA = ['PP', 'P', 'M', 'G', 'GG', 'XG', 'XXG']

const EMPTY = {
  data_nascimento: '', genero: '', estado_civil: '', nacionalidade: 'Brasileira',
  cpf: '', rg: '', rg_orgao_emissor: '', rg_data_expedicao: '',
  filiacao_mae: '', filiacao_pai: '',
  endereco_cep: '', endereco_rua: '', endereco_numero: '', endereco_complemento: '',
  endereco_bairro: '', endereco_cidade: '', endereco_estado: '',
  telefone_celular: '', email_pessoal: '',
  emergencia_nome: '', emergencia_parentesco: '', emergencia_telefone: '',
  portfolio_url: '', tamanho_camiseta: '', restricoes_alimentares: '',
}

export function TabPessoal({ usuarioId }: { usuarioId: string }) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState(EMPTY)

  useEffect(() => {
    getFuncPessoal(usuarioId).then((data) => {
      if (data) {
        setForm({
          data_nascimento: data.data_nascimento ?? '',
          genero: data.genero ?? '',
          estado_civil: data.estado_civil ?? '',
          nacionalidade: data.nacionalidade ?? 'Brasileira',
          cpf: data.cpf ?? '',
          rg: data.rg ?? '',
          rg_orgao_emissor: data.rg_orgao_emissor ?? '',
          rg_data_expedicao: data.rg_data_expedicao ?? '',
          filiacao_mae: data.filiacao_mae ?? '',
          filiacao_pai: data.filiacao_pai ?? '',
          endereco_cep: data.endereco_cep ?? '',
          endereco_rua: data.endereco_rua ?? '',
          endereco_numero: data.endereco_numero ?? '',
          endereco_complemento: data.endereco_complemento ?? '',
          endereco_bairro: data.endereco_bairro ?? '',
          endereco_cidade: data.endereco_cidade ?? '',
          endereco_estado: data.endereco_estado ?? '',
          telefone_celular: data.telefone_celular ?? '',
          email_pessoal: data.email_pessoal ?? '',
          emergencia_nome: data.emergencia_nome ?? '',
          emergencia_parentesco: data.emergencia_parentesco ?? '',
          emergencia_telefone: data.emergencia_telefone ?? '',
          portfolio_url: data.portfolio_url ?? '',
          tamanho_camiseta: data.tamanho_camiseta ?? '',
          restricoes_alimentares: data.restricoes_alimentares ?? '',
        })
      }
      setLoading(false)
    })
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
      await saveFuncPessoal(usuarioId, form)
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
      <Section title="Identificação">
        <G2>
          <Field label="Data de nascimento">
            <input type="date" className={inputCls} value={form.data_nascimento}
              onChange={(e) => set('data_nascimento', e.target.value)} />
          </Field>
          <Field label="Gênero">
            <select className={inputCls} value={form.genero} onChange={(e) => set('genero', e.target.value)}>
              <option value="">Selecione</option>
              {GENEROS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </Field>
          <Field label="Estado civil">
            <select className={inputCls} value={form.estado_civil} onChange={(e) => set('estado_civil', e.target.value)}>
              <option value="">Selecione</option>
              {ESTADOS_CIVIS.map((ec) => <option key={ec} value={ec}>{ec}</option>)}
            </select>
          </Field>
          <Field label="Nacionalidade">
            <input type="text" className={inputCls} placeholder="Brasileira"
              value={form.nacionalidade} onChange={(e) => set('nacionalidade', e.target.value)} />
          </Field>
        </G2>
      </Section>

      <Section title="Documentos Básicos">
        <G2>
          <Field label="CPF">
            <MaskedInput
              value={form.cpf}
              onChange={(v) => set('cpf', v)}
              mask={maskCPF}
              validate={validateCPF}
              placeholder="000.000.000-00"
            />
          </Field>
          <Field label="RG">
            <input type="text" className={inputCls} placeholder="00.000.000-0"
              value={form.rg} onChange={(e) => set('rg', e.target.value)} />
          </Field>
          <Field label="RG — órgão emissor">
            <input type="text" className={inputCls} placeholder="SSP/SP, DETRAN, etc."
              value={form.rg_orgao_emissor} onChange={(e) => set('rg_orgao_emissor', e.target.value)} />
          </Field>
          <Field label="RG — data de expedição">
            <input type="date" className={inputCls}
              value={form.rg_data_expedicao} onChange={(e) => set('rg_data_expedicao', e.target.value)} />
          </Field>
          <Field label="Filiação — nome da mãe">
            <input type="text" className={inputCls} value={form.filiacao_mae}
              onChange={(e) => set('filiacao_mae', e.target.value)} />
          </Field>
          <Field label="Filiação — nome do pai">
            <input type="text" className={inputCls} value={form.filiacao_pai}
              onChange={(e) => set('filiacao_pai', e.target.value)} />
          </Field>
        </G2>
      </Section>

      <Section title="Endereço Residencial">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="CEP">
            <MaskedInput
              value={form.endereco_cep}
              onChange={(v) => set('endereco_cep', v)}
              mask={maskCEP}
              validate={validateCEP}
              placeholder="00000-000"
            />
          </Field>
          <div />
          <div className="sm:col-span-2">
            <Field label="Rua / Logradouro">
              <input type="text" className={inputCls}
                value={form.endereco_rua} onChange={(e) => set('endereco_rua', e.target.value)} />
            </Field>
          </div>
          <Field label="Número">
            <input type="text" className={inputCls}
              value={form.endereco_numero} onChange={(e) => set('endereco_numero', e.target.value)} />
          </Field>
          <Field label="Complemento">
            <input type="text" className={inputCls} placeholder="Apto, bloco..."
              value={form.endereco_complemento} onChange={(e) => set('endereco_complemento', e.target.value)} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Bairro">
              <input type="text" className={inputCls}
                value={form.endereco_bairro} onChange={(e) => set('endereco_bairro', e.target.value)} />
            </Field>
          </div>
          <Field label="Cidade">
            <input type="text" className={inputCls}
              value={form.endereco_cidade} onChange={(e) => set('endereco_cidade', e.target.value)} />
          </Field>
          <Field label="Estado (UF)">
            <select className={inputCls} value={form.endereco_estado}
              onChange={(e) => set('endereco_estado', e.target.value)}>
              <option value="">Selecione</option>
              {ESTADOS_BR.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
            </select>
          </Field>
        </div>
      </Section>

      <Section title="Contato">
        <G2>
          <Field label="Telefone celular">
            <MaskedInput
              value={form.telefone_celular}
              onChange={(v) => set('telefone_celular', v)}
              mask={maskTelefone}
              validate={validateTelefone}
              placeholder="(13) 90000-0000"
              type="tel"
            />
          </Field>
          <Field label="E-mail pessoal">
            <MaskedInput
              value={form.email_pessoal}
              onChange={(v) => set('email_pessoal', v)}
              validate={validateEmail}
              placeholder="pessoal@email.com"
              type="email"
            />
          </Field>
          <Field label="Contato de emergência — nome">
            <input type="text" className={inputCls}
              value={form.emergencia_nome} onChange={(e) => set('emergencia_nome', e.target.value)} />
          </Field>
          <Field label="Contato de emergência — parentesco">
            <input type="text" className={inputCls} placeholder="Mãe, pai, cônjuge, irmão(ã)..."
              value={form.emergencia_parentesco} onChange={(e) => set('emergencia_parentesco', e.target.value)} />
          </Field>
          <Field label="Contato de emergência — telefone">
            <MaskedInput
              value={form.emergencia_telefone}
              onChange={(v) => set('emergencia_telefone', v)}
              mask={maskTelefone}
              validate={validateTelefone}
              placeholder="(13) 90000-0000"
              type="tel"
            />
          </Field>
        </G2>
      </Section>

      <Section title="Portfólio e Redes Profissionais">
        <Field label="Link (LinkedIn, Behance, GitHub, site pessoal…)" note="Cole o endereço completo com https://">
          <input type="url" className={inputCls} placeholder="https://linkedin.com/in/..."
            value={form.portfolio_url} onChange={(e) => set('portfolio_url', e.target.value)} />
        </Field>
      </Section>

      <Section title="Informações Adicionais">
        <G2>
          <Field label="Tamanho de camiseta">
            <select className={inputCls} value={form.tamanho_camiseta}
              onChange={(e) => set('tamanho_camiseta', e.target.value)}>
              <option value="">Selecione</option>
              {TAMANHOS_CAMISETA.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
        </G2>
        <Field label="Restrições alimentares ou alergias" note='Deixe em branco se não houver'>
          <textarea rows={2} className={`${inputCls} resize-none leading-relaxed`}
            placeholder="Ex.: vegetariano, intolerante a lactose, alergia a amendoim…"
            value={form.restricoes_alimentares}
            onChange={(e) => set('restricoes_alimentares', e.target.value)} />
        </Field>
      </Section>

      <Feedback error={error} success={success} />
      <SaveBtn saving={saving} />
    </form>
  )
}
