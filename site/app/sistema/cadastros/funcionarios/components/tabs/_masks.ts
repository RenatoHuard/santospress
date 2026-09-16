// ── Formatadores ─────────────────────────────────────────────────────

export function maskCEP(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 8)
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d
}

export function maskTelefone(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (!d) return ''
  if (d.length <= 2) return `(${d}`
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

export function maskCNPJ(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 14)
  if (d.length <= 2) return d
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`
  if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`
}

export function maskCPF(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

// ── Validadores ───────────────────────────────────────────────────────

export function validateEmail(v: string): string | null {
  if (!v.trim()) return null
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? null : 'E-mail inválido'
}

export function validateCEP(v: string): string | null {
  if (!v.trim()) return null
  return v.replace(/\D/g, '').length === 8 ? null : 'CEP deve ter 8 dígitos'
}

export function validateTelefone(v: string): string | null {
  if (!v.trim()) return null
  const d = v.replace(/\D/g, '')
  return d.length >= 10 && d.length <= 11 ? null : 'Telefone inválido'
}

export function validateCNPJ(v: string): string | null {
  if (!v.trim()) return null
  const d = v.replace(/\D/g, '')
  if (d.length !== 14) return 'CNPJ deve ter 14 dígitos'
  if (/^(\d)\1{13}$/.test(d)) return 'CNPJ inválido'
  const calc = (weights: number[]) => {
    const s = weights.reduce((acc, w, i) => acc + parseInt(d[i]) * w, 0)
    const r = s % 11
    return r < 2 ? 0 : 11 - r
  }
  return calc([5,4,3,2,9,8,7,6,5,4,3,2]) === parseInt(d[12]) &&
         calc([6,5,4,3,2,9,8,7,6,5,4,3,2]) === parseInt(d[13])
    ? null : 'CNPJ inválido'
}

export function validateCPF(v: string): string | null {
  if (!v.trim()) return null
  const d = v.replace(/\D/g, '')
  if (d.length !== 11) return 'CPF deve ter 11 dígitos'
  if (/^(\d)\1{10}$/.test(d)) return 'CPF inválido'
  const calc = (n: number) => {
    const s = Array.from({ length: n }, (_, i) => parseInt(d[i]) * (n + 1 - i)).reduce((a, b) => a + b, 0)
    const r = (s * 10) % 11
    return r === 10 || r === 11 ? 0 : r
  }
  return calc(9) === parseInt(d[9]) && calc(10) === parseInt(d[10]) ? null : 'CPF inválido'
}
