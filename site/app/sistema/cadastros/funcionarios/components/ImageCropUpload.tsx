'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import ReactCrop, {
  type Crop,
  type PixelCrop,
  centerCrop,
  makeAspectCrop,
} from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { uploadFuncFoto } from '../../../actions/rh'
import { updateFuncFotoUrl } from '../../../actions'

interface Props {
  usuarioId: string
  currentUrl: string
  onChange: (url: string) => void
}

function initCrop(w: number, h: number): Crop {
  return centerCrop(makeAspectCrop({ unit: '%', width: 90 }, 1, w, h), w, h)
}

const LOGO = '/images/Logo_santospress_negativo.png'

export function ImageCropUpload({ usuarioId, currentUrl, onChange }: Props) {
  const [src, setSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setSrc(reader.result as string)
      setCrop(undefined)
      setCompletedCrop(undefined)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget
    setCrop(initCrop(width, height))
  }

  async function handleCropAndUpload() {
    if (!imgRef.current || !completedCrop) return

    const img = imgRef.current
    const scaleX = img.naturalWidth / img.width
    const scaleY = img.naturalHeight / img.height
    const cropW = completedCrop.width * scaleX
    const cropH = completedCrop.height * scaleY
    const size = Math.round(Math.min(cropW, cropH))

    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(
      img,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      cropW,
      cropH,
      0, 0, size, size,
    )

    const blob = await new Promise<Blob>((res, rej) =>
      canvas.toBlob(
        (b) => (b ? res(b) : rej(new Error('Canvas vazio'))),
        'image/jpeg',
        0.92,
      )
    )

    const fd = new FormData()
    fd.append('file', blob, 'avatar.jpg')
    fd.append('usuarioId', usuarioId)

    setUploading(true)
    setUploadError(null)
    try {
      const url = await uploadFuncFoto(fd)
      await updateFuncFotoUrl(usuarioId, url)
      onChange(url)
      setSrc(null)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Erro ao enviar foto')
    } finally {
      setUploading(false)
    }
  }

  async function handleRemove() {
    await updateFuncFotoUrl(usuarioId, '')
    onChange('')
  }

  return (
    <div className="space-y-3">
      {/* Prévia circular */}
      <div className="relative w-28 h-28 mx-auto rounded-full overflow-hidden bg-navy">
        {currentUrl ? (
          <Image
            src={currentUrl}
            alt="Foto do funcionário"
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <Image
            src={LOGO}
            alt="SantosPress"
            fill
            className="object-contain p-3"
          />
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={onFileChange}
      />

      <div className="text-center space-y-1">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="text-sm text-gold hover:text-[#9e2126] transition-colors underline underline-offset-2"
        >
          {currentUrl ? 'Trocar foto' : 'Enviar foto'}
        </button>
        {currentUrl && (
          <div>
            <button
              type="button"
              onClick={handleRemove}
              className="text-xs text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
            >
              Remover foto
            </button>
          </div>
        )}
      </div>

      {uploadError && (
        <p className="text-red-500 dark:text-red-400 text-xs text-center">{uploadError}</p>
      )}

      {/* Modal de recorte */}
      {src && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl overflow-hidden w-full max-w-lg shadow-2xl">
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                Recortar foto
              </h3>
              <button
                type="button"
                onClick={() => setSrc(null)}
                className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                aria-label="Fechar"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Área de corte */}
            <div className="p-4 flex justify-center bg-gray-50 dark:bg-black/30 overflow-auto max-h-[55vh]">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                circularCrop
                minWidth={60}
                minHeight={60}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={imgRef}
                  src={src}
                  onLoad={onImageLoad}
                  alt="Imagem para recorte"
                  style={{ maxHeight: '50vh', maxWidth: '100%', display: 'block' }}
                />
              </ReactCrop>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSrc(null)}
                className="text-sm text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={uploading || !completedCrop}
                onClick={handleCropAndUpload}
                className="bg-gold text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#9e2126] disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {uploading && (
                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                )}
                {uploading ? 'Enviando...' : 'Cortar e salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
