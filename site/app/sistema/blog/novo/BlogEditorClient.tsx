'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import ImageExt from '@tiptap/extension-image'
import LinkExt from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import { TextStyle } from '@tiptap/extension-text-style'
import Highlight from '@tiptap/extension-highlight'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { salvarPost, uploadBlogImagem } from '@/app/sistema/actions/blog'
import { TopNav } from '@/app/sistema/components/TopNav'

// ── Imagem redimensionável ─────────────────────────────────────────

const ResizableImage = ImageExt.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (el) => el.getAttribute('width'),
        renderHTML: ({ width }) =>
          width
            ? { width, style: `width:${width};max-width:100%;height:auto;display:block;` }
            : { style: 'max-width:100%;height:auto;display:block;' },
      },
    }
  },
})

// ── Análise de qualidade ───────────────────────────────────────────

interface QualityCheck {
  id: string
  label: string
  status: 'ok' | 'warn' | 'error' | 'na'
  detail?: string
}

interface QualityResult {
  wordCount: number
  readingTime: number
  score: number
  checks: QualityCheck[]
}

function analyzeQuality(
  html: string,
  titulo: string,
  seoTitulo: string,
  seoDescricao: string,
  palavraChave: string,
  capaUrl: string,
): QualityResult {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  const words = text.split(/\s+/).filter((w) => w.length > 0)
  const wordCount = words.length
  const readingTime = Math.max(1, Math.ceil(wordCount / 200))
  const effectiveTitle = seoTitulo || titulo
  const checks: QualityCheck[] = []

  // Título SEO
  const tLen = effectiveTitle.length
  checks.push({
    id: 'titulo-len',
    label: 'Título SEO (50–60 chars)',
    status: tLen >= 50 && tLen <= 60 ? 'ok' : tLen >= 40 && tLen <= 70 ? 'warn' : tLen === 0 ? 'error' : 'warn',
    detail: `${tLen} chars`,
  })

  // Meta descrição
  const dLen = seoDescricao.length
  checks.push({
    id: 'desc-len',
    label: 'Meta descrição (150–160 chars)',
    status: dLen === 0 ? 'error' : dLen >= 150 && dLen <= 160 ? 'ok' : dLen >= 120 && dLen <= 175 ? 'warn' : 'error',
    detail: `${dLen} chars`,
  })

  // Contagem de palavras
  checks.push({
    id: 'words',
    label: 'Mínimo 300 palavras',
    status: wordCount >= 300 ? 'ok' : wordCount >= 150 ? 'warn' : 'error',
    detail: `${wordCount} palavras`,
  })

  // H2 subtítulos
  const h2Count = (html.match(/<h2[^>]*>/gi) ?? []).length
  checks.push({
    id: 'h2',
    label: 'Usa subtítulos H2',
    status: h2Count > 0 ? 'ok' : wordCount < 100 ? 'na' : 'warn',
    detail: h2Count > 0 ? `${h2Count} H2` : undefined,
  })

  // Imagem de capa
  checks.push({
    id: 'capa',
    label: 'Imagem de capa',
    status: capaUrl ? 'ok' : 'warn',
  })

  // Alt text nas imagens
  const imgTotal = (html.match(/<img[^>]*>/gi) ?? []).length
  const imgAlt = (html.match(/alt="[^"]+"/gi) ?? []).length
  if (imgTotal > 0) {
    checks.push({
      id: 'img-alt',
      label: 'Alt text nas imagens',
      status: imgAlt >= imgTotal ? 'ok' : 'warn',
      detail: `${imgAlt}/${imgTotal}`,
    })
  }

  // Links internos/externos
  const linkCount = (html.match(/<a[^>]+href/gi) ?? []).length
  if (wordCount >= 150) {
    checks.push({
      id: 'links',
      label: 'Inclui links',
      status: linkCount > 0 ? 'ok' : 'warn',
      detail: linkCount > 0 ? `${linkCount} link(s)` : undefined,
    })
  }

  // Checks com palavra-chave
  if (palavraChave.trim()) {
    const kw = palavraChave.toLowerCase().trim()
    const kwRe = new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')

    checks.push({
      id: 'kw-titulo',
      label: 'Palavra-chave no título',
      status: effectiveTitle.toLowerCase().includes(kw) ? 'ok' : 'error',
    })

    checks.push({
      id: 'kw-desc',
      label: 'Palavra-chave na descrição',
      status: seoDescricao.toLowerCase().includes(kw) ? 'ok' : 'warn',
    })

    const firstP = (html.match(/<p[^>]*>([\s\S]*?)<\/p>/i)?.[1] ?? '').replace(/<[^>]+>/g, '')
    checks.push({
      id: 'kw-intro',
      label: 'Palavra-chave no 1º parágrafo',
      status: firstP.toLowerCase().includes(kw) ? 'ok' : 'warn',
    })

    const kwCount = (text.toLowerCase().match(kwRe) ?? []).length
    const density = wordCount > 0 ? (kwCount / wordCount) * 100 : 0
    checks.push({
      id: 'kw-density',
      label: 'Densidade 0.5–2.5%',
      status: density >= 0.5 && density <= 2.5 ? 'ok' : density > 0 && density < 4 ? 'warn' : 'error',
      detail: `${density.toFixed(1)}% (${kwCount}×)`,
    })
  }

  const applicable = checks.filter((c) => c.status !== 'na')
  const score = applicable.length > 0 ? Math.round((applicable.filter((c) => c.status === 'ok').length / applicable.length) * 100) : 0

  return { wordCount, readingTime, score, checks }
}

// ── Utilitários ─────────────────────────────────────────────────────

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 100)
}

// ── Props ────────────────────────────────────────────────────────────

interface InitialPost {
  id: string
  titulo: string
  slug: string
  resumo: string | null
  conteudo: string | null
  capa_url: string | null
  status: 'rascunho' | 'publicado'
  autor_id: string | null
  categoria: string | null
  tags: string[] | null
  seo_titulo: string | null
  seo_descricao: string | null
  publicado_em: string | null
}

interface Props {
  funcionarios: { id: string; nome: string; email: string; is_coringa: boolean }[]
  initialPost?: InitialPost
}

// ── Estilos compartilhados ──────────────────────────────────────────

const INPUT =
  'w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/8 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-gold/50 focus:ring-2 focus:ring-gold/15 transition text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600'

const LABEL = 'block text-[10px] font-semibold tracking-widest uppercase text-gray-400 dark:text-gray-500 mb-1.5'

const TB_BTN = (active: boolean) =>
  `px-2 py-1.5 rounded text-sm font-medium transition-all ${
    active
      ? 'bg-gray-200 dark:bg-white/20 text-gray-900 dark:text-white'
      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/8'
  }`

const TB_DIV = 'w-px h-5 bg-gray-200 dark:bg-white/10 mx-1 self-center'

// ── Componente principal ────────────────────────────────────────────

export function BlogEditorClient({ funcionarios, initialPost }: Props) {
  const router = useRouter()

  // Form state — pre-filled if editing
  const [titulo, setTitulo] = useState(initialPost?.titulo ?? '')
  const [slug, setSlug] = useState(initialPost?.slug ?? '')
  const [slugEdited, setSlugEdited] = useState(!!initialPost?.slug)
  const [resumo, setResumo] = useState(initialPost?.resumo ?? '')
  const [capaUrl, setCapaUrl] = useState(initialPost?.capa_url ?? '')
  const [capaUploading, setCapaUploading] = useState(false)
  const [status, setStatus] = useState<'rascunho' | 'publicado'>(initialPost?.status ?? 'rascunho')
  const [autorId, setAutorId] = useState(initialPost?.autor_id ?? '')
  const [categoria, setCategoria] = useState(initialPost?.categoria ?? '')
  const [tags, setTags] = useState<string[]>(initialPost?.tags ?? [])
  const [tagInput, setTagInput] = useState('')

  // SEO
  const [seoTitulo, setSeoTitulo] = useState(initialPost?.seo_titulo ?? '')
  const [seoDescricao, setSeoDescricao] = useState(initialPost?.seo_descricao ?? '')
  const [palavraChave, setPalavraChave] = useState('')

  // UI
  const [panel, setPanel] = useState<'config' | 'seo' | 'qualidade'>('config')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  // Image modal
  const [imgModal, setImgModal] = useState(false)
  const [imgMode, setImgMode] = useState<'upload' | 'url'>('upload')
  const [imgUrl, setImgUrl] = useState('')
  const [imgAlt, setImgAlt] = useState('')
  const [imgUploading, setImgUploading] = useState(false)

  // Link input
  const [linkOpen, setLinkOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkNewTab, setLinkNewTab] = useState(true)
  const linkRef = useRef<HTMLInputElement>(null)

  // Editor content for quality analysis
  const [htmlContent, setHtmlContent] = useState(initialPost?.conteudo ?? '')
  // savedId: ID do post já salvo (new or existing)
  const [savedId, setSavedId] = useState<string | null>(initialPost?.id ?? null)

  // ── Editor ──────────────────────────────────────────────────────

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Highlight.configure({ multicolor: false }),
      LinkExt.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: 'https',
        HTMLAttributes: { rel: 'noopener noreferrer' },
      }),
      ResizableImage,
      TextAlign.configure({ types: ['heading', 'paragraph', 'image'] }),
      Placeholder.configure({ placeholder: 'Comece a escrever o seu post aqui...' }),
      CharacterCount,
    ],
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none focus:outline-none min-h-[500px] px-8 py-6',
      },
    },
    onUpdate: ({ editor }) => setHtmlContent(editor.getHTML()),
  })

  // ── Auto-slug ───────────────────────────────────────────────────

  useEffect(() => {
    if (!slugEdited) setSlug(slugify(titulo))
  }, [titulo, slugEdited])

  // ── Carregar conteúdo inicial no editor ─────────────────────────

  useEffect(() => {
    if (editor && initialPost?.conteudo) {
      editor.commands.setContent(initialPost.conteudo)
    }
  }, [editor, initialPost?.conteudo])

  // ── Detectar autor logado ───────────────────────────────────────

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) {
        const f = funcionarios.find((f) => f.email === user.email)
        if (f && !initialPost?.autor_id) setAutorId(f.id)
      }
    })
  }, [funcionarios, initialPost?.autor_id])

  // ── Análise de qualidade ─────────────────────────────────────────

  const quality = useMemo(
    () => analyzeQuality(htmlContent, titulo, seoTitulo, seoDescricao, palavraChave, capaUrl),
    [htmlContent, titulo, seoTitulo, seoDescricao, palavraChave, capaUrl],
  )

  // ── Handlers ────────────────────────────────────────────────────

  async function handleSave(forceStatus?: 'rascunho' | 'publicado') {
    if (!titulo.trim()) {
      alert('Adicione um título antes de salvar.')
      return
    }
    setSaving(true)
    try {
      const effectiveStatus = forceStatus ?? status
      const id = await salvarPost({
        id: savedId ?? undefined,
        titulo: titulo.trim(),
        slug: slug.trim() || slugify(titulo),
        resumo: resumo.trim(),
        conteudo: editor?.getHTML() ?? '',
        capa_url: capaUrl,
        status: effectiveStatus,
        autor_id: autorId,
        seo_titulo: seoTitulo,
        seo_descricao: seoDescricao,
        tags,
        categoria,
        publicado_em: initialPost?.publicado_em ?? undefined,
      })
      setSavedId(id)
      if (forceStatus) setStatus(forceStatus)
      setSaveMsg(effectiveStatus === 'publicado' ? '✓ Publicado!' : '✓ Rascunho salvo')
      setTimeout(() => setSaveMsg(''), 3000)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  async function handleCapaUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setCapaUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      setCapaUrl(await uploadBlogImagem(fd))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao fazer upload da imagem.')
    } finally {
      setCapaUploading(false)
      e.target.value = ''
    }
  }

  async function handleImgFileSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImgUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      setImgUrl(await uploadBlogImagem(fd))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao fazer upload da imagem.')
    } finally {
      setImgUploading(false)
      e.target.value = ''
    }
  }

  function handleInsertImage() {
    if (!imgUrl || !editor) return
    editor.chain().focus().setImage({ src: imgUrl, alt: imgAlt }).run()
    setImgModal(false)
    setImgUrl('')
    setImgAlt('')
  }

  function handleOpenLink() {
    if (!editor) return
    if (editor.isActive('link')) {
      setLinkUrl(editor.getAttributes('link').href ?? '')
    } else {
      setLinkUrl('')
    }
    setLinkOpen(true)
    setTimeout(() => linkRef.current?.focus(), 50)
  }

  function handleInsertLink() {
    if (!editor) return
    if (!linkUrl.trim()) {
      editor.chain().focus().unsetLink().run()
    } else {
      editor.chain().focus().setLink({ href: linkUrl, target: linkNewTab ? '_blank' : null }).run()
    }
    setLinkOpen(false)
  }

  function addTag() {
    const t = tagInput.trim().toLowerCase()
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t])
    setTagInput('')
  }

  // ── Toolbar helper ───────────────────────────────────────────────

  const t = editor

  if (!t) return null

  const imgSelected = t.isActive('image')

  // ── Render ───────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        .tiptap.ProseMirror p.is-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
        }
        .tiptap.ProseMirror:focus { outline: none; }
      `}</style>

      <div className="flex flex-col h-screen bg-gray-50 dark:bg-[#0a0a0a]">
        <TopNav />

        <div className="flex flex-1 overflow-hidden">
          {/* ── Editor column ─────────────────────────────── */}
          <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-[#111111]">

            {/* Sub-header */}
            <div className="h-14 border-b border-gray-100 dark:border-white/5 flex items-center px-6 gap-4 shrink-0">
              <Link href="/sistema/blog" className="text-gray-400 hover:text-gray-700 dark:hover:text-white text-sm transition-colors">
                ← Painel
              </Link>
              <span className="text-gray-200 dark:text-white/10">|</span>
              <span className="text-xs text-gray-400 dark:text-gray-600 uppercase tracking-widest">Novo Post</span>

              <div className="ml-auto flex items-center gap-3">
                {saveMsg && (
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">{saveMsg}</span>
                )}
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'rascunho' | 'publicado')}
                  className="text-xs border border-gray-200 dark:border-white/8 rounded-lg px-3 py-1.5 bg-white dark:bg-[#1a1a1a] text-gray-600 dark:text-gray-300 outline-none"
                >
                  <option value="rascunho">Rascunho</option>
                  <option value="publicado">Publicado</option>
                </select>
                <button
                  onClick={() => setShowPreview(true)}
                  className="px-4 py-1.5 text-sm border border-gray-200 dark:border-white/10 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Preview
                </button>
                <button
                  onClick={() => handleSave()}
                  disabled={saving}
                  className="px-4 py-1.5 text-sm border border-gray-200 dark:border-white/10 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Salvando…' : 'Salvar'}
                </button>
                <button
                  onClick={() => handleSave('publicado')}
                  disabled={saving}
                  className="px-4 py-1.5 text-sm bg-gold text-white rounded-lg font-semibold hover:bg-gold/90 transition-colors disabled:opacity-50"
                >
                  Publicar
                </button>
              </div>
            </div>

            {/* Title + slug + excerpt */}
            <div className="px-8 pt-7 pb-5 border-b border-gray-100 dark:border-white/5 shrink-0">
              <input
                type="text"
                placeholder="Título do post"
                className="text-3xl font-bold w-full bg-transparent outline-none text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-white/15"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
              />
              <div className="flex items-center gap-2 mt-3">
                <span className="text-xs text-gray-400 dark:text-gray-600 font-mono shrink-0">/blog/</span>
                <input
                  type="text"
                  className="text-xs text-gray-500 dark:text-gray-500 font-mono bg-transparent outline-none flex-1 border-b border-dashed border-gray-200 dark:border-white/10 pb-0.5 hover:border-gray-400 focus:border-gold transition-colors"
                  value={slug}
                  onChange={(e) => { setSlug(e.target.value); setSlugEdited(true) }}
                  placeholder="slug-do-post"
                />
                {slugEdited && (
                  <button
                    onClick={() => { setSlug(slugify(titulo)); setSlugEdited(false) }}
                    className="text-[10px] text-gray-400 hover:text-gold transition-colors"
                  >
                    ↺ auto
                  </button>
                )}
              </div>
              <textarea
                placeholder="Resumo breve (aparece nos cards do blog)…"
                className="mt-4 text-sm text-gray-500 dark:text-gray-400 w-full bg-transparent outline-none resize-none placeholder:text-gray-300 dark:placeholder:text-white/15"
                rows={2}
                value={resumo}
                onChange={(e) => setResumo(e.target.value)}
              />
            </div>

            {/* Toolbar */}
            <div className="border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-[#161616] px-4 py-1.5 flex items-center gap-0.5 flex-wrap shrink-0">
              {/* History */}
              <button title="Desfazer" onClick={() => t.chain().focus().undo().run()} className={TB_BTN(false)}>⟲</button>
              <button title="Refazer"  onClick={() => t.chain().focus().redo().run()} className={TB_BTN(false)}>⟳</button>
              <span className={TB_DIV} />

              {/* Format */}
              <button title="Negrito (Ctrl+B)"    onClick={() => t.chain().focus().toggleBold().run()}          className={TB_BTN(t.isActive('bold'))}>        <b>B</b></button>
              <button title="Itálico (Ctrl+I)"    onClick={() => t.chain().focus().toggleItalic().run()}        className={TB_BTN(t.isActive('italic'))}>      <i>I</i></button>
              <button title="Sublinhado (Ctrl+U)" onClick={() => t.chain().focus().toggleUnderline().run()}     className={TB_BTN(t.isActive('underline'))}>   <u>U</u></button>
              <button title="Tachado"             onClick={() => t.chain().focus().toggleStrike().run()}        className={TB_BTN(t.isActive('strike'))}>      <s>S</s></button>
              <button title="Código inline"       onClick={() => t.chain().focus().toggleCode().run()}          className={TB_BTN(t.isActive('code'))}>        <code className="font-mono text-xs">`</code></button>
              <button title="Destaque"            onClick={() => t.chain().focus().toggleHighlight().run()}     className={TB_BTN(t.isActive('highlight'))}>   <span className="bg-yellow-200 dark:bg-yellow-600 px-0.5 rounded text-[11px]">H</span></button>
              <span className={TB_DIV} />

              {/* Headings */}
              {([1, 2, 3, 4] as const).map((lvl) => (
                <button key={lvl} title={`Título H${lvl}`}
                  onClick={() => t.chain().focus().toggleHeading({ level: lvl }).run()}
                  className={TB_BTN(t.isActive('heading', { level: lvl }))}>
                  <span className="font-mono text-xs">H{lvl}</span>
                </button>
              ))}
              <button title="Parágrafo normal" onClick={() => t.chain().focus().setParagraph().run()} className={TB_BTN(t.isActive('paragraph'))}>
                <span className="text-xs">¶</span>
              </button>
              <span className={TB_DIV} />

              {/* Lists */}
              <button title="Lista com marcadores" onClick={() => t.chain().focus().toggleBulletList().run()} className={TB_BTN(t.isActive('bulletList'))}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>
              </button>
              <button title="Lista numerada" onClick={() => t.chain().focus().toggleOrderedList().run()} className={TB_BTN(t.isActive('orderedList'))}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16M9 6V5a1 1 0 00-1-1H7a1 1 0 00-1 1v1"/></svg>
              </button>
              <button title="Citação" onClick={() => t.chain().focus().toggleBlockquote().run()} className={TB_BTN(t.isActive('blockquote'))}>
                <span className="text-base leading-none">"</span>
              </button>
              <button title="Bloco de código" onClick={() => t.chain().focus().toggleCodeBlock().run()} className={TB_BTN(t.isActive('codeBlock'))}>
                <span className="font-mono text-xs">{'{}'}</span>
              </button>
              <button title="Linha horizontal" onClick={() => t.chain().focus().setHorizontalRule().run()} className={TB_BTN(false)}>
                <span className="text-xs">—</span>
              </button>
              <span className={TB_DIV} />

              {/* Align */}
              <button title="Alinhar à esquerda" onClick={() => t.chain().focus().setTextAlign('left').run()}    className={TB_BTN(t.isActive({ textAlign: 'left' }))}>◁</button>
              <button title="Centralizar"         onClick={() => t.chain().focus().setTextAlign('center').run()} className={TB_BTN(t.isActive({ textAlign: 'center' }))}>≡</button>
              <button title="Alinhar à direita"   onClick={() => t.chain().focus().setTextAlign('right').run()}  className={TB_BTN(t.isActive({ textAlign: 'right' }))}>▷</button>
              <span className={TB_DIV} />

              {/* Insert */}
              <button
                title="Inserir link"
                onClick={handleOpenLink}
                className={TB_BTN(t.isActive('link'))}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </button>
              <button
                title="Inserir imagem"
                onClick={() => setImgModal(true)}
                className={TB_BTN(false)}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
            </div>

            {/* Link input bar */}
            {linkOpen && (
              <div className="border-b border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 px-4 py-2 flex items-center gap-2 shrink-0">
                <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                <input
                  ref={linkRef}
                  type="url"
                  placeholder="https://..."
                  className="flex-1 text-sm bg-transparent outline-none text-gray-800 dark:text-white placeholder:text-gray-400"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleInsertLink(); if (e.key === 'Escape') setLinkOpen(false) }}
                />
                <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer select-none whitespace-nowrap">
                  <input type="checkbox" checked={linkNewTab} onChange={(e) => setLinkNewTab(e.target.checked)} className="accent-gold" />
                  Nova aba
                </label>
                {t.isActive('link') && (
                  <button onClick={() => { t.chain().focus().unsetLink().run(); setLinkOpen(false) }} className="text-xs text-red-500 hover:text-red-700 whitespace-nowrap">
                    Remover
                  </button>
                )}
                <button onClick={handleInsertLink} className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg">OK</button>
                <button onClick={() => setLinkOpen(false)} className="text-gray-400 hover:text-gray-700 dark:hover:text-white ml-1">×</button>
              </div>
            )}

            {/* Image resize bar (when image is selected) */}
            {imgSelected && (
              <div className="border-b border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 px-4 py-1.5 flex items-center gap-3 shrink-0">
                <span className="text-xs text-amber-700 dark:text-amber-400 font-medium shrink-0">Tamanho:</span>
                {(['25%', '50%', '75%', '100%'] as const).map((w) => (
                  <button key={w} onClick={() => t.chain().focus().updateAttributes('resizableImage', { width: w }).run()}
                    className="px-2.5 py-1 text-xs bg-white dark:bg-amber-900/40 border border-amber-200 dark:border-amber-700 rounded-lg text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/80 transition-colors">
                    {w}
                  </button>
                ))}
                <span className="w-px h-4 bg-amber-200 dark:bg-amber-700 mx-1" />
                <span className="text-xs text-amber-700 dark:text-amber-400 font-medium">Alinhamento:</span>
                {(['left', 'center', 'right'] as const).map((a) => (
                  <button key={a} onClick={() => t.chain().focus().setTextAlign(a).run()}
                    className="px-2.5 py-1 text-xs bg-white dark:bg-amber-900/40 border border-amber-200 dark:border-amber-700 rounded-lg text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/80 transition-colors">
                    {a === 'left' ? '◁' : a === 'center' ? '≡' : '▷'}
                  </button>
                ))}
                <button onClick={() => t.chain().focus().deleteSelection().run()}
                  className="ml-auto px-2.5 py-1 text-xs bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/80 transition-colors">
                  Remover
                </button>
              </div>
            )}

            {/* Editor content */}
            <div className="flex-1 overflow-y-auto">
              <EditorContent editor={editor} />
            </div>

            {/* Status bar */}
            <div className="border-t border-gray-100 dark:border-white/5 px-8 py-2 flex items-center gap-4 text-[11px] text-gray-400 dark:text-gray-600 shrink-0">
              <span>{quality.wordCount} palavras</span>
              <span>·</span>
              <span>{quality.readingTime} min de leitura</span>
              <span>·</span>
              <span>{editor?.storage.characterCount?.characters?.() ?? 0} caracteres</span>
            </div>
          </div>

          {/* ── Right panel ──────────────────────────────── */}
          <div className="w-80 border-l border-gray-100 dark:border-white/5 flex flex-col overflow-hidden bg-white dark:bg-[#0d0d0d] shrink-0">
            {/* Panel tabs */}
            <div className="flex border-b border-gray-100 dark:border-white/5 shrink-0">
              {(['config', 'seo', 'qualidade'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPanel(p)}
                  className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition-colors ${
                    panel === p
                      ? 'text-gold border-b-2 border-gold'
                      : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
                >
                  {p === 'config' ? '📝 Post' : p === 'seo' ? '🔍 SEO' : '📊 Qualidade'}
                </button>
              ))}
            </div>

            {/* Panel content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5">

              {/* ── Config panel ─────────────────────────── */}
              {panel === 'config' && (
                <>
                  {/* Author */}
                  <div>
                    <label className={LABEL}>Autor</label>
                    <select value={autorId} onChange={(e) => setAutorId(e.target.value)} className={INPUT}>
                      <option value="">Selecionar…</option>
                      {funcionarios.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.is_coringa ? `${f.nome} (Editorial)` : f.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Category */}
                  <div>
                    <label className={LABEL}>Categoria</label>
                    <input type="text" className={INPUT} placeholder="ex. Marketing, Imprensa…" value={categoria} onChange={(e) => setCategoria(e.target.value)} />
                  </div>

                  {/* Tags */}
                  <div>
                    <label className={LABEL}>Tags</label>
                    <div className="flex flex-wrap gap-1.5 p-2.5 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/8 rounded-xl min-h-[42px]">
                      {tags.map((tag) => (
                        <span key={tag} className="flex items-center gap-1 bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300 text-xs px-2.5 py-1 rounded-full">
                          {tag}
                          <button onClick={() => setTags(tags.filter((t) => t !== tag))} className="text-gray-400 hover:text-red-500 transition-colors">×</button>
                        </span>
                      ))}
                      <input
                        type="text"
                        className="flex-1 min-w-[80px] text-xs bg-transparent outline-none text-gray-700 dark:text-white placeholder:text-gray-400"
                        placeholder={tags.length === 0 ? 'Adicionar tag…' : ''}
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
                            e.preventDefault(); addTag()
                          }
                          if (e.key === 'Backspace' && !tagInput && tags.length > 0) setTags(tags.slice(0, -1))
                        }}
                      />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">Enter ou vírgula para adicionar</p>
                  </div>

                  {/* Featured image */}
                  <div>
                    <label className={LABEL}>Imagem de capa</label>
                    {capaUrl ? (
                      <div className="relative rounded-xl overflow-hidden aspect-video bg-gray-100 dark:bg-[#1a1a1a]">
                        <img src={capaUrl} alt="Capa" className="w-full h-full object-cover" />
                        <button
                          onClick={() => setCapaUrl('')}
                          className="absolute top-2 right-2 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center text-xs hover:bg-black/80 transition-colors"
                        >×</button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl p-5 cursor-pointer hover:border-gold/60 transition-colors group">
                        {capaUploading ? (
                          <div className="w-5 h-5 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <svg className="w-6 h-6 text-gray-300 dark:text-gray-600 group-hover:text-gold transition-colors mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-xs text-gray-400">Clique para upload</span>
                          </>
                        )}
                        <input type="file" accept="image/*" className="hidden" onChange={handleCapaUpload} />
                      </label>
                    )}
                  </div>
                </>
              )}

              {/* ── SEO panel ──────────────────────────────── */}
              {panel === 'seo' && (
                <>
                  <div>
                    <label className={LABEL}>Palavra-chave foco</label>
                    <input type="text" className={INPUT} placeholder="ex. marketing esportivo" value={palavraChave} onChange={(e) => setPalavraChave(e.target.value)} />
                    <p className="text-[10px] text-gray-400 mt-1">Usada para calcular a qualidade do post</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className={LABEL}>Título SEO</label>
                      <SeoBar value={seoTitulo || titulo} min={50} max={60} softMax={70} />
                    </div>
                    <input
                      type="text"
                      className={INPUT}
                      placeholder={titulo || 'Título otimizado para buscadores…'}
                      value={seoTitulo}
                      onChange={(e) => setSeoTitulo(e.target.value)}
                    />
                    <p className="text-[10px] text-gray-400 mt-1">{(seoTitulo || titulo).length}/60 chars</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className={LABEL}>Meta descrição</label>
                      <SeoBar value={seoDescricao} min={150} max={160} softMax={175} />
                    </div>
                    <textarea
                      className={`${INPUT} resize-none`}
                      rows={4}
                      placeholder="Descrição exibida nos resultados do Google…"
                      value={seoDescricao}
                      onChange={(e) => setSeoDescricao(e.target.value)}
                    />
                    <p className="text-[10px] text-gray-400 mt-1">{seoDescricao.length}/160 chars</p>
                  </div>

                  {/* SERP preview */}
                  <div className="bg-gray-50 dark:bg-[#0a0a0a] border border-gray-100 dark:border-white/5 rounded-xl p-4">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Preview Google</p>
                    <p className="text-blue-600 dark:text-blue-400 text-sm font-medium leading-snug truncate">{seoTitulo || titulo || 'Título do post'}</p>
                    <p className="text-green-700 dark:text-green-600 text-[11px] mt-0.5">santospress.com.br/blog/{slug || 'slug-do-post'}</p>
                    <p className="text-gray-600 dark:text-gray-400 text-[12px] mt-1 leading-relaxed line-clamp-2">{seoDescricao || resumo || 'A meta descrição aparecerá aqui. Adicione uma descrição otimizada para SEO.'}</p>
                  </div>
                </>
              )}

              {/* ── Quality panel ─────────────────────────── */}
              {panel === 'qualidade' && (
                <>
                  {/* Score */}
                  <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-[#0a0a0a] rounded-xl border border-gray-100 dark:border-white/5">
                    <div className="relative w-16 h-16 shrink-0">
                      <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#e5e7eb" strokeWidth="2.5" className="dark:stroke-white/10" />
                        <circle cx="18" cy="18" r="15.9155" fill="none"
                          stroke={quality.score >= 70 ? '#22c55e' : quality.score >= 40 ? '#f59e0b' : '#ef4444'}
                          strokeWidth="2.5"
                          strokeDasharray={`${quality.score} 100`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-base font-bold text-gray-900 dark:text-white">{quality.score}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">
                        {quality.score >= 70 ? 'Boa qualidade' : quality.score >= 40 ? 'Pode melhorar' : 'Precisa de atenção'}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{quality.wordCount} palavras · {quality.readingTime} min leitura</p>
                    </div>
                  </div>

                  {/* Checklist */}
                  <div className="space-y-2">
                    {quality.checks.map((check) => (
                      <div key={check.id} className={`flex items-start gap-2.5 p-2.5 rounded-xl text-xs ${
                        check.status === 'ok'   ? 'bg-green-50 dark:bg-green-950/30' :
                        check.status === 'warn' ? 'bg-amber-50 dark:bg-amber-950/30' :
                        check.status === 'na'   ? 'bg-gray-50 dark:bg-white/3' :
                                                  'bg-red-50 dark:bg-red-950/30'
                      }`}>
                        <span className="shrink-0 mt-0.5">
                          {check.status === 'ok'   ? '✅' :
                           check.status === 'warn' ? '⚠️' :
                           check.status === 'na'   ? '○' : '❌'}
                        </span>
                        <div className="flex-1">
                          <span className={`font-medium ${
                            check.status === 'ok'   ? 'text-green-800 dark:text-green-300' :
                            check.status === 'warn' ? 'text-amber-800 dark:text-amber-300' :
                            check.status === 'na'   ? 'text-gray-400' :
                                                      'text-red-800 dark:text-red-300'
                          }`}>{check.label}</span>
                          {check.detail && (
                            <span className="text-gray-500 dark:text-gray-500 ml-1">({check.detail})</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {!palavraChave && (
                    <p className="text-[11px] text-gray-400 dark:text-gray-600 text-center bg-gray-50 dark:bg-white/3 rounded-xl p-3">
                      Defina uma palavra-chave na aba SEO para análise completa
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Preview modal ───────────────────────────────────── */}
      {showPreview && (
        <div className="fixed inset-0 z-[60] overflow-auto bg-white">
          {/* Sticky bar */}
          <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-gray-100 px-6 py-3 flex items-center justify-between">
            <span className="text-xs text-gray-400 uppercase tracking-widest font-semibold">
              Pré-visualização — como ficará no site
            </span>
            <button
              onClick={() => setShowPreview(false)}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Fechar preview
            </button>
          </div>

          {/* Conteúdo renderizado como no site público */}
          <main>
            {capaUrl ? (
              <div className="relative h-64 md:h-[420px] overflow-hidden">
                <img src={capaUrl} alt={titulo} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-navy/75" />
                <div className="absolute inset-0 flex items-end">
                  <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
                    <h1 className="text-2xl md:text-4xl font-bold text-white mb-4 leading-snug">
                      {titulo || 'Sem título'}
                    </h1>
                    {categoria && <span className="text-gold text-sm">{categoria}</span>}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-navy py-20">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                  <h1 className="text-3xl md:text-5xl font-bold text-white mb-5 leading-snug">
                    {titulo || 'Sem título'}
                  </h1>
                  {categoria && <span className="text-gold text-sm">{categoria}</span>}
                </div>
              </div>
            )}

            <div className="bg-white">
              <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {resumo && (
                  <p className="text-gray-500 text-lg mb-8 leading-relaxed border-l-4 border-gold pl-4">
                    {resumo}
                  </p>
                )}
                <div
                  className="prose prose-lg max-w-none prose-headings:text-navy prose-a:text-gold prose-strong:text-navy"
                  dangerouslySetInnerHTML={{ __html: editor?.getHTML() ?? '' }}
                />
                <div className="mt-14 pt-8 border-t border-gray-100">
                  <span className="text-gold font-semibold text-sm">← Voltar às Notícias</span>
                </div>
              </div>
            </div>
          </main>
        </div>
      )}

      {/* ── Image modal ─────────────────────────────────────── */}
      {imgModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setImgModal(false)}>
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-100 dark:border-white/8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-gray-900 dark:text-white">Inserir Imagem</h3>
              <button onClick={() => setImgModal(false)} className="text-gray-400 hover:text-gray-700 dark:hover:text-white text-xl leading-none">×</button>
            </div>

            {/* Mode tabs */}
            <div className="flex border-b border-gray-100 dark:border-white/8 mb-4">
              {(['upload', 'url'] as const).map((m) => (
                <button key={m} onClick={() => setImgMode(m)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${imgMode === m ? 'border-gold text-gold' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                  {m === 'upload' ? 'Upload' : 'URL'}
                </button>
              ))}
            </div>

            {imgMode === 'upload' ? (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl p-8 cursor-pointer hover:border-gold/60 transition-colors">
                {imgUploading ? (
                  <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                ) : imgUrl ? (
                  <div className="text-center">
                    <p className="text-green-600 text-sm font-medium">✓ Imagem enviada</p>
                    <img src={imgUrl} alt="" className="mt-2 max-h-20 rounded-lg" />
                  </div>
                ) : (
                  <>
                    <svg className="w-8 h-8 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <span className="text-sm text-gray-400">Clique para selecionar</span>
                  </>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleImgFileSelect} />
              </label>
            ) : (
              <input type="url" placeholder="https://..." className={INPUT} value={imgUrl} onChange={(e) => setImgUrl(e.target.value)} />
            )}

            <div className="mt-3">
              <label className={LABEL}>Texto alternativo (alt)</label>
              <input type="text" className={INPUT} placeholder="Descreva a imagem…" value={imgAlt} onChange={(e) => setImgAlt(e.target.value)} />
            </div>

            <div className="flex justify-end gap-3 mt-5">
              <button onClick={() => setImgModal(false)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors">Cancelar</button>
              <button
                onClick={handleInsertImage}
                disabled={!imgUrl || imgUploading}
                className="px-4 py-2 bg-gold text-white text-sm rounded-xl font-semibold hover:bg-gold/90 disabled:opacity-50 transition-colors"
              >
                Inserir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ── Componente auxiliar: barra SEO ─────────────────────────────────

function SeoBar({ value, min, max, softMax }: { value: string; min: number; max: number; softMax: number }) {
  const len = value.length
  const color = len >= min && len <= max ? 'bg-green-500' : len >= min - 10 && len <= softMax ? 'bg-amber-400' : len === 0 ? 'bg-gray-200 dark:bg-white/10' : 'bg-red-500'
  const width = Math.min(100, (len / softMax) * 100)
  return (
    <div className="w-16 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${width}%` }} />
    </div>
  )
}
