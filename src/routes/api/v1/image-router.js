import express from 'express'
import { ImageController } from '../../../controllers/api/image-controller.js'
export const router = express.Router()

const controller = new ImageController()

router.get('/images', controller.authenticateJWT, (req, res, next) => controller.getAllImages(req, res, next))
router.param('id', (req, res, next, id) => controller.getOneImage(req, res, next, id))
router.post('/images', controller.authenticateJWT, (req, res, next) => controller.postImage(req, res, next))
