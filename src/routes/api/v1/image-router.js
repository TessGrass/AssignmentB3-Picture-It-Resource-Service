import express from 'express'
import { ImageController } from '../../../controllers/api/image-controller.js'
export const router = express.Router()

const controller = new ImageController()
router.param('id', controller.authenticateJWT)
router.get('/images', controller.authenticateJWT, (req, res, next) => controller.getAllImages(req, res, next))
router.get('/images/:id', controller.authorizeUser, controller.getSpecificImage)
router.post('/images', controller.authenticateJWT, (req, res, next) => controller.postImage(req, res, next))
router.patch('/images/:id', controller.authorizeUser, controller.patchImage)
router.put('/images/:id', controller.authorizeUser, controller.putImage)
router.delete('/images/:id', controller.authorizeUser, controller.deleteSpecificImage)

/* router.param('id', controller.authenticateJWT)
router.get('/images', controller.authenticateJWT, (req, res, next) => controller.getAllImages(req, res, next))
router.get('/images/:id', controller.authenticateJWT, (req, res, next) => controller.getSingleImage(req, res, next))
router.post('/images', controller.authenticateJWT, (req, res, next) => controller.postImage(req, res, next))
router.patch('/images/:id', controller.authenticateJWT, (req, res, next) => controller.patchImage(req, res, next))
router.put('/images/:id', controller.authorizeUser, controller.putImage)
router.delete('/images/:id', controller.authenticateJWT, (req, res, next) => controller.deleteSingleImage(req, res, next)) */
