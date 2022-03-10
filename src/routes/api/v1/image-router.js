import express from 'express'
import { ImageController } from '../../../controllers/api/image-controller.js'
export const router = express.Router()

const controller = new ImageController()

router.get('/images', controller.authenticateJWT, (req, res, next) => controller.getImage(req, res, next))
router.get('/images/:id', controller.authenticateJWT, (req, res, next) => controller.getImage(req, res, next))
router.post('/images', controller.authenticateJWT, (req, res, next) => controller.postImage(req, res, next))
