import sharp from 'sharp'
import path from 'node:path'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

// Genera los íconos de la PWA (favicon, apple-touch-icon, manifest icons)
// a partir del logo real (src/assets/logo.png), centrado sobre un fondo
// blanco cuadrado con margen. Volver a correr si se reemplaza el logo.
//
// El wordmark completo se usa para los íconos grandes (192/512/apple-touch).
// Para el favicon (ilegible a 16-32px como texto) se recorta solo la marca
// de las barras diagonales + la "C", más compacta y reconocible en miniatura.

const dirname = path.dirname(fileURLToPath(import.meta.url))
const logoPath = path.resolve(dirname, '../src/assets/logo.png')
const outDir = path.resolve(dirname, '../public/icons')
mkdirSync(outDir, { recursive: true })

const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 }
const WHITE = { r: 255, g: 255, b: 255, alpha: 1 }

async function getTrimmedLogo() {
  return sharp(logoPath).trim({ background: TRANSPARENT }).toBuffer()
}

async function makeIcon(size, { logoScale = 0.86, background = WHITE, fileName, sourceBuffer }) {
  const logoSize = Math.round(size * logoScale)
  const logoBuffer = await sharp(sourceBuffer)
    .resize(logoSize, logoSize, { fit: 'contain', background: TRANSPARENT })
    .toBuffer()

  await sharp({ create: { width: size, height: size, channels: 4, background } })
    .composite([{ input: logoBuffer, gravity: 'center' }])
    .png()
    .toFile(path.join(outDir, fileName))

  console.log(`Generado icons/${fileName}`)
}

async function makeFavicon(size, fileName, markBuffer) {
  const logoSize = Math.round(size * 0.86)
  const logoBuffer = await sharp(markBuffer)
    .resize(logoSize, logoSize, { fit: 'contain', background: TRANSPARENT })
    .toBuffer()

  await sharp({ create: { width: size, height: size, channels: 4, background: WHITE } })
    .composite([{ input: logoBuffer, gravity: 'center' }])
    .png()
    .toFile(path.resolve(dirname, '../public', fileName))

  console.log(`Generado ${fileName}`)
}

const trimmedWordmark = await getTrimmedLogo()
const { width, height } = await sharp(trimmedWordmark).metadata()
// Recorte aproximado de la marca "///C" (barras + primera letra) para favicon.
const markBuffer = await sharp(trimmedWordmark)
  .extract({ left: 0, top: 0, width: Math.round(width * 0.53), height })
  .toBuffer()

await makeIcon(192, { fileName: 'icon-192.png', sourceBuffer: trimmedWordmark })
await makeIcon(512, { fileName: 'icon-512.png', sourceBuffer: trimmedWordmark })
// maskable: el logo debe quedar dentro de la "safe zone" (círculo central ~80%)
await makeIcon(512, { logoScale: 0.6, fileName: 'icon-maskable-512.png', sourceBuffer: trimmedWordmark })
await makeIcon(180, { fileName: 'apple-touch-icon.png', sourceBuffer: trimmedWordmark })

await makeFavicon(32, 'favicon-32.png', markBuffer)
await makeFavicon(16, 'favicon-16.png', markBuffer)
