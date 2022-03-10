import express from 'express'
import { router as imageRouter } from './image-router.js'

export const router = express.Router()

router.use('/', imageRouter)
