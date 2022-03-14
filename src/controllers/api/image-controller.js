
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
   * Authorize user.
   *
   * @param {object} req - Express request object.
   * @param {object} res  - Express respons object.
   * @param {Function} next - Express next middleware function.
   */
  async authorizeUser (req, res, next) {
    console.log('----authorizeUser-----')
    if (req.body.contentType === undefined || req.body.data === undefined) {
      const err = createError(400)
      next(err)
    } else {
      const image = await Image.findOne({ imgId: req.params.id })
      if (image !== null) {
        if (image.userId === req.user.id) {
          console.log('userid stämmer överens')
        } else {
          console.log('403 i authorize')
          const err = createError(403)
          next(err)
        }
      } else {
        console.log('404 i authorize')
        const err = createError(404)
        next(err)
      }
      res.locals.image = image
      next()
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
   */
  async getSpecificImage (req, res, next) {
    try {
      console.log('-----getSingleImage------')
      // const img = res.locals.image
      console.log(res.locals.image.imgId)
      const image = await Image.find({ imgId: res.locals.image.imgId })
      res
        .status(200)
        .json(image)
      /* const imageId = Object.values(req.params)
      /* if (image.length === 0) {
        const err = createError(404)
        next(err)
        return
      } */
      /* if (image.find(i => i.userId === req.user.id)) {
        res
          .status(200)
          .json(image)
      } else {
        const err = createError(403)
        next(err)
      } */
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
      if (req.body.contentType === undefined || req.body.data === undefined) {
        const err = createError(400)
        next(err)
      }
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
      console.log(req.params)
      const image = res.locals.image
      /* const image = await Image.findOne({ imgId: req.params.id })
      console.log(image) */
      /* if (image !== null) {
        if (image.userId === req.user.id) { */
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
    /* } else {
          const err = createError(403)
          next(err)
        }
      } else {
        const err = createError(404)
        next(err)
      } */
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
        // const image = await Image.findOne({ imgId: req.params.id })
        const image = res.locals.image
        /* if (image !== null) { */
        /* if (image.userId === req.user.id) { */
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
      } /* else {
            const err = createError(403)
            next(err)
          } */
      /* } else {
          const err = createError(404)
          next(err)
        } */
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
   */
  async deleteSpecificImage (req, res, next) {
    try {
      const image = res.locals.image
      console.log('-----deleteSpecificImage-----')
      /* const image = await Image.findOne({ imgId: req.params.id }) */

      /* if (image !== null) { */
      /* if (image.userId === req.user.id) { */
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
      /* } else {
          const err = createError(403)
          next(err)
        } */
      /* } else {
        const err = createError(404)
        next(err)
      } */
    } catch (error) {
      const err = createError(500)
      next(err)
    }
  }
}
