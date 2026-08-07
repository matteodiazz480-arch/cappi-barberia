import sharp from 'sharp'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Banner principal del Hero (Barberia/banner.png): collage de 3 fotos de la
// barbería, alta resolución (3780x1890, ratio 2:1). Se usa como fondo del
// Hero a pantalla completa. Acá solo lo re-exportamos como JPEG optimizado
// (el PNG original pesa ~3MB, innecesario para una foto) sin tocar el
// encuadre — el recorte final ocurre en runtime vía object-fit:cover, y con
// este ratio (2:1) no hay riesgo de cortar texto a la mitad como pasaba con
// el banner panorámico anterior.
//
// Volver a correr si se reemplaza el banner original.

const dirname = path.dirname(fileURLToPath(import.meta.url))
const source = path.resolve(dirname, '../../banner.png')
const dest = path.resolve(dirname, '../src/assets/banner.jpg')

await sharp(source)
  .resize({ width: 2600, withoutEnlargement: true })
  .jpeg({ quality: 88, mozjpeg: true })
  .toFile(dest)

console.log('Generado src/assets/banner.jpg (optimizado desde banner.png, max 2600px de ancho)')
