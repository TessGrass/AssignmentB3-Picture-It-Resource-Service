
import jwt from 'jsonwebtoken'
import createError from 'http-errors'
import fetch from 'node-fetch'
import { Image } from '../../models/image-model.js'
/**
 * Represents a Image Controller class.
 */
export class ImageController {
  /**
   * Authenticate a JWT.
   *
   * @param {object} req - Express request object.
   * @param {object} res  - Express respons object.
   * @param {Function} next - Express next middleware function.
   */
  authenticateJWT (req, res, next) {
    try {
      const publicKey = Buffer.from(process.env.ACCESS_TOKEN_PUBLIC, 'base64')
      const authorization = req.headers.authorization?.split(' ')

      if (authorization?.[0] !== 'Bearer') {
        next(createError(401))
      }
      const jwtPayload = jwt.verify(authorization[1], publicKey)
      req.user = {
        username: jwtPayload.username,
        email: jwtPayload.email,
        id: jwtPayload.id
      }
      next()
    } catch (error) {
      const err = createError(401)
      next(err)
    }
  }

  /**
   * Authorize user.
   *
   * @param {object} req - Express request object.
   * @param {object} res  - Express respons object.
   * @param {Function} next - Express next middleware function.
   */
  async authorizeUser (req, res, next) {
    const image = await Image.findOne({ imgId: req.params.id })
    if (image !== null) {
      if (image.userId === req.user.id) {
        req.image = image
        next()
      } else {
        const err = createError(403)
        next(err)
      }
    } else {
      const err = createError(404)
      next(err)
    }
  }

  /**
   * Fetching image from authorized owner.
   *
   * @param {object} req - Express request object.
   * @param {object} res  - Express respons object.
   * @param {Function} next - Express next middleware function.
   */
  async getAllImages (req, res, next) {
    try {
      const usersImages = await Image.find({ userId: req.user.id })
      res
        .status(200)
        .json(usersImages)
    } catch (error) {
      const err = createError(500)
      next(err)
    }
  }

  /**
   * Get a specific image.
   *
   * @param {object} req - Express request object.
   * @param {object} res  - Express respons object.
   * @param {Function} next - Express next middleware function.
   */
  async getSpecificImage (req, res, next) {
    try {
      const image = await Image.find({ imgId: req.image.imgId })
      res
        .status(200)
        .json(image)
    } catch (error) {
      const err = createError(500)
      next(err)
    }
  }

  /**
   * Post image to Image service.
   *
   * @param {object} req - Express request object.
   * @param {object} res  - Express respons object.
   * @param {Function} next - Express next middleware function.
   */
  async postImage (req, res, next) {
    try {
      const imgData = {
        data: req.body.data,
        contentType: req.body.contentType
      }
      const fetchedData = await fetch('https://courselab.lnu.se/picture-it/images/api/v1/images', {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
          'x-API-Private-Token': `${process.env.PERSONAL_TOKEN_SECRET}`
        },
        body: JSON.stringify(imgData)
      })
      const data = await fetchedData.json()

      const imageSchema = new Image({
        userName: req.user.username,
        userId: req.user.id,
        imgId: data.id,
        imgUrl: data.imageUrl,
        description: req.body.description,
        contentType: data.contentType
      })
      await imageSchema.save()
      res
        .status(201)
        .json(imageSchema)
    } catch (err) {
      let error = err
      if (err.name === 'ValidationError') {
        error = createError(400)
      } else {
        error = createError(500)
      }
      next(error)
    }
  }

  /**
   * Patch an image.
   *
   * @param {object} req - Express request object.
   * @param {object} res  - Express respons object.
   * @param {Function} next - Express next middleware function.
   */
  async patchImage (req, res, next) {
    try {
      const image = req.image
      const fetchedData = await fetch(`https://courselab.lnu.se/picture-it/images/api/v1/images/${req.params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-type': 'application/json',
          'x-API-Private-Token': `${process.env.PERSONAL_TOKEN_SECRET}`
        },
        body: JSON.stringify(req.body)
      })
      if (fetchedData) {
        const patchImage = await Image.findByIdAndUpdate(image.id, req.body, { runValidators: true })
        await patchImage.save()
        res.sendStatus(204)
      }
    } catch (err) {
      let error = err
      if (err.name === 'ValidationError') {
        error = createError(400)
      } else {
        error = createError(500)
      }
      next(error)
    }
  }

  /**
   * Change image with put verb.
   *
   * @param {object} req - Express request object.
   * @param {object} res  - Express respons object.
   * @param {Function} next - Express next middleware function.
   */
  async putImage (req, res, next) {
    try {
      if (req.body.contentType === undefined || req.body.data === undefined) {
        const err = createError(400)
        next(err)
      } else {
        const image = req.image
        const body = {
          data: req.body.data,
          contentType: req.body.contentType,
          description: req.body.description ? req.body.description : ''
        }
        const fetchedData = await fetch(`https://courselab.lnu.se/picture-it/images/api/v1/images/${req.params.id}`, {
          method: 'PUT',
          headers: {
            'Content-type': 'application/json',
            'x-API-Private-Token': `${process.env.PERSONAL_TOKEN_SECRET}`
          },
          body: JSON.stringify(body)
        })
        if (fetchedData) {
          const putImage = await Image.findByIdAndUpdate(image.id, body, { runValidators: true })
          await putImage.save()
          res.sendStatus(204)
        }
      }
    } catch (err) {
      let error = err
      if (err.name === 'ValidationError') {
        error = createError(400)
      } else {
        error = createError(500)
      }
      next(error)
    }
  }

  /**
   * Delete an image.
   *
   * @param {object} req - Express request object.
   * @param {object} res  - Express respons object.
   * @param {Function} next - Express next middleware function.
   */
  async deleteSpecificImage (req, res, next) {
    try {
      const image = req.image
      const fetchedData = await fetch(`https://courselab.lnu.se/picture-it/images/api/v1/images/${req.params.id}`, {
        method: 'DELETE',
        headers: {
          'Content-type': 'application/json',
          'x-API-Private-Token': `${process.env.PERSONAL_TOKEN_SECRET}`
        },
        body: JSON.stringify(req.params.id)
      })
      if (fetchedData) {
        await Image.findByIdAndDelete(image.id)
        res.sendStatus(204)
      }
    } catch (error) {
      const err = createError(500)
      next(err)
    }
  }
}
