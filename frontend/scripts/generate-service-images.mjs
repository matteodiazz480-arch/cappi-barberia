import sharp from 'sharp'
import path from 'node:path'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

// Genera imágenes placeholder elegantes para los servicios de ejemplo.
// Reemplazables luego a mano: solo hay que pisar el archivo con el mismo
// nombre en public/images/services/ (o cambiar la URL en el panel admin).

const dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.resolve(dirname, '../public/images/services')
mkdirSync(outDir, { recursive: true })

const WIDTH = 900
const HEIGHT = 675

function svgFor(label) {
  return `
  <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#1c1c21"/>
        <stop offset="100%" stop-color="#0a0a0b"/>
      </linearGradient>
    </defs>
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
    ${Array.from({ length: 14 })
      .map((_, i) => {
        const x = -200 + i * 90
        return `<path d="M ${x} ${HEIGHT} L ${x + 260} 0" stroke="#ffffff" stroke-opacity="0.045" stroke-width="26"/>`
      })
      .join('')}
    <text x="50%" y="52%" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="54" fill="#ffffff" letter-spacing="2">${label}</text>
    <text x="50%" y="60%" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="500" font-size="17" fill="#ffffff" fill-opacity="0.55" letter-spacing="6">CAPPI BARBERÍA</text>
  </svg>`
}

const services = [
  { file: 'corte-clasico.jpg', label: 'CORTE CLÁSICO' },
  { file: 'fade-degradado.jpg', label: 'FADE // DEGRADADO' },
  { file: 'arreglo-barba.jpg', label: 'ARREGLO DE BARBA' },
]

for (const service of services) {
  await sharp(Buffer.from(svgFor(service.label)))
    .jpeg({ quality: 88 })
    .toFile(path.join(outDir, service.file))
  console.log(`Generado images/services/${service.file}`)
}
