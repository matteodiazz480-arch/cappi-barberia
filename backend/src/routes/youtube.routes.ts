import { Router } from 'express'
import { getLatestVideos } from '../services/youtube.service.js'

export const youtubeRouter = Router()

youtubeRouter.get('/latest', async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 6, 20)
    const videos = await getLatestVideos(limit)
    res.json(videos)
  } catch (error) {
    next(error)
  }
})
