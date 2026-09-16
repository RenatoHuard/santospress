'use client'

import { type ReactNode, useState } from 'react'

export const inputCls =
  'w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/8 text-gray-900 dark:text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-gold/50 focus:ring-2 focus:ring-gold/15 transition placeholder:text-gray-400 dark:placeholder:text-gray-700'

export const ESTADOS_BR = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA',
  'MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN',
  'RS','RO','RR','SC','SP','SE','TO',
]

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl p-6 space-y-5">
      <h3 className="text-xs text-gray-400 dark:text-gray-600 uppercase tracking-widest font-medium">
        {title}
      </h3>
      {children}
    </div>
  )
}

export function Field({
  label, note, children, full,
}: {
  label: string; note?: string; children: ReactNode; full?: boolean
}) {
  return (
    <div className={full ? 'col-span-2' : undefined}>
      <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1.5">
        {label}
        {note && <span className="text-gray-400 dark:text-gray-600 text-xs ml-2">{note}</span>}
      </label>
      {children}
    </div>
  )
}

export function G2({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">{children}</div>
}

export function G3({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">{children}</div>
}

export function TabLoader() {
  return (
    <div className="flex justify-center py-24">
      <div className="w-7 h-7 border-2 border-gold border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export function SaveBtn({ saving }: { saving: boolean }) {
  return (
    <button
      type="submit"
      disabled={saving}
      className="bg-gold text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#9e2126] disabled:opacity-50 transition-colors flex items-center gap-2"
    >
      {saving && (
        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
      )}
      {saving ? 'Salvando...' : 'Salvar alterações'}
    </button>
  )
}

export function Feedback({ error, success }: { error?: string | null; success?: boolean }) {
  if (error)
    return (
      <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/30 rounded-xl px-4 py-3 text-red-600 dark:text-red-400 text-sm">
        {error}
      </div>
    )
  if (success)
    return (
      <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/20 rounded-xl px-4 py-3 text-green-700 dark:text-green-400 text-sm">
        Dados salvos com sucesso.
      </div>
    )
  return null
}

/**
 * Input com máscara e validação inline.
 * - mask: função que formata o valor conforme o usuário digita
 * - validate: função que retorna mensagem de erro ou null (roda no onBlur)
 * - onBlurExtra: callback adicional no onBlur (ex: busca CEP)
 */
export function MaskedInput({
  value,
  onChange,
  mask,
  validate,
  placeholder,
  type = 'text',
  onBlurExtra,
  required,
}: {
  value: string
  onChange: (v: string) => void
  mask?: (v: string) => string
  validate?: (v: string) => string | null
  placeholder?: string
  type?: string
  onBlurExtra?: () => void
  required?: boolean
}) {
  const [fieldError, setFieldError] = useState<string | null>(null)

  return (
    <div>
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        className={[
          inputCls,
          fieldError
            ? 'border-red-400 dark:border-red-500 focus:border-red-400 focus:ring-red-400/15'
            : '',
        ].join(' ')}
        onChange={(e) => {
          const formatted = mask ? mask(e.target.value) : e.target.value
          onChange(formatted)
          if (fieldError) setFieldError(null)
        }}
        onBlur={() => {
          if (validate) setFieldError(validate(value))
          onBlurExtra?.()
        }}
      />
      {fieldError && (
        <p className="text-xs text-red-500 dark:text-red-400 mt-1 pl-1">{fieldError}</p>
      )}
    </div>
  )
}

export function BoolToggle({
  label, note, checked, onChange,
}: {
  label: string; note?: string; checked: boolean; onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
        {note && <p className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">{note}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 rounded-full transition-colors duration-200 focus:outline-none ${
          checked ? 'bg-gold' : 'bg-gray-200 dark:bg-white/10'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 mt-0.5 rounded-full bg-white shadow transition-transform duration-200 ${
            checked ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  )
}
