export const REGIOES_IMPRENSA = [
  'Nacional', 'SP', 'RJ', 'MG', 'RS', 'PR', 'SC',
  'BA', 'PE', 'CE', 'GO', 'DF', 'AM', 'PA',
] as const
export type RegiaoImprensa = typeof REGIOES_IMPRENSA[number]

export const TIPOS_MIDIA = [
  'Portal de Notícias', 'TV', 'Rádio', 'Jornal', 'Revista',
  'Agência de Notícias', 'Blog', 'Podcast', 'Newsletter', 'Assessoria',
] as const
export type TipoMidia = typeof TIPOS_MIDIA[number]

export const EDITORIAS_IMPRENSA = [
  'Política', 'Economia', 'Negócios', 'Tecnologia', 'Esportes',
  'Entretenimento', 'Saúde', 'Educação', 'Cultura', 'Sustentabilidade',
  'Internacional', 'Policial', 'Ciência', 'Gastronomia', 'Moda',
] as const
export type EditoriaImprensa = typeof EDITORIAS_IMPRENSA[number]
