import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { youtubeRouter } from './routes/youtube.routes.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()
const port = Number(process.env.PORT) || 4000
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173'

app.use(cors({ origin: corsOrigin }))
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/youtube', youtubeRouter)

app.use(errorHandler)

app.listen(port, () => {
  console.log(`Backend escuchando en http://localhost:${port}`)
})
