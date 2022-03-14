
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
    console.log('-----authenticateJWT-----')
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
   * Fetching image from authorized owner.
   *
   * @param {object} req - Express request object.
   * @param {object} res  - Express respons object.
   * @param {Function} next - Express next middleware function.
   */
  async getAllImages (req, res, next) {
    try {
      console.log('----getAllImages-----')
      // await Image.findById(req.user.id) // VAD GÖR DU??
      const usersImages = await Image.find({ userId: req.user.id })
      res
        .status(200)
        .json(usersImages)
    } catch (error) {
      next(error)
    }
  }

  /**
   * Get a specific image.
   *
   * @param {object} req - Express request object.
   * @param {object} res  - Express respons object.
   * @param {Function} next - Express next middleware function.
   * @param {string} id  - The value of the id.
   */
  async getSingleImage (req, res, next, id) {
    try {
      console.log('-----getSingleImage------')
      const imageId = Object.values(req.params)
      const image = await Image.find({ imgId: imageId })
      if (image.length === 0) {
        const err = createError(404)
        next(err)
        return
      }
      if (image.find(i => i.userId === req.user.id)) {
        res
          .status(200)
          .json(image)
      } else {
        const err = createError(403)
        next(err)
      }
    } catch (error) {
      next(error)
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
    console.log('-----postImage-----')
    try {
      if (!req.body.data || !req.body.contentType) {
        throw new Error('image data and/or content type missing')
      }
      const imgData = {
        data: req.body.data,
        contentType: req.body.contentType
      }
      console.log(imgData)
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
      res
        .status(201)
        .json(imageSchema)
      await imageSchema.save()
    } catch (error) {
      const err = createError(500)
      next(err)
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
      console.log('-----patchImage-----')
      const image = await Image.findOne({ imgId: req.params.id })
      // && image.userId === req.user.id
      if (image !== null) {
        if (image.userId === req.user.id) {
          const fetchedData = await fetch(`https://courselab.lnu.se/picture-it/images/api/v1/images/${req.params.id}`, {
            method: 'PATCH',
            headers: {
              'Content-type': 'application/json',
              'x-API-Private-Token': `${process.env.PERSONAL_TOKEN_SECRET}`
            },
            body: JSON.stringify(req.body)
          })
          if (fetchedData) {
            const patchImage = await Image.findByIdAndUpdate(image.id, req.body)
            await patchImage.save()
            res.sendStatus(204)
          }
        } else {
          const err = createError(403)
          next(err)
        }
      } else {
        const err = createError(404)
        next(err)
      }
    } catch (error) {
      const err = createError(500)
      next(err)
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
    console.log('-----putImage-----')
    try {
      if (req.body.contentType === undefined || req.body.data === undefined) {
        const err = createError(400)
        next(err)
      } else {
        const image = await Image.findOne({ imgId: req.params.id })
        if (image !== null) {
          if (image.userId === req.user.id) {
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
              const putImage = await Image.findByIdAndUpdate(image.id, req.body, { runValidators: true })
              await putImage.save()
              res.sendStatus(204)
            }
          } else {
            const err = createError(403)
            next(err)
          }
        } else {
          const err = createError(404)
          next(err)
        }
      }
    } catch (error) {
      const err = createError(500)
      next(err)
    }
  }

  /**
   * Delete an image.
   *
   * @param {object} req - Express request object.
   * @param {object} res  - Express respons object.
   * @param {Function} next - Express next middleware function.
   * @param {string} id  - The value of the id.
   */
  async deleteSingleImage (req, res, next, id) {
    try {
      console.log('-----deleteSingleImage-----')
      const image = await Image.findOne({ imgId: req.params.id })

      if (image !== null) {
        if (image.userId === req.user.id) {
          const fetchedData = await fetch('https://courselab.lnu.se/picture-it/images/api/v1/images', {
            method: 'DELETE',
            headers: {
              'Content-type': 'application/json',
              'x-API-Private-Token': `${process.env.PERSONAL_TOKEN_SECRET}`
            },
            body: JSON.stringify(req.params.id)
          })
          if (fetchedData) {
            await Image.findByIdAndDelete(image.id)
            // await Image.findOneAndDelete({ id: req.params.id })
            res.sendStatus(204)
          }
        } else {
          const err = createError(403)
          next(err)
        }
      } else {
        const err = createError(404)
        next(err)
      }
    } catch (error) {
      const err = createError(500)
      next(err)
    }
  }
}
