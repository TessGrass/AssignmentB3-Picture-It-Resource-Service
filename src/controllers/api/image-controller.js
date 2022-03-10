
import jwt from 'jsonwebtoken'
import createError from 'http-errors'
import fetch from 'node-fetch'
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
    console.log('authenticateJWT')
    const publicKey = Buffer.from(process.env.ACCESS_TOKEN_PUBLIC, 'base64')
    const authorization = req.headers.authorization?.split(' ')

    if (authorization?.[0] !== 'Bearer') {
      console.log('fel')
      next(createError(401))
    }

    try {
      console.log('inside try i authenticateJWT')
      const jwtPayload = jwt.verify(authorization[1], publicKey)
      req.user = {
        username: jwtPayload.username,
        email: jwtPayload.email,
        id: jwtPayload.id
      }
      next()
    } catch (error) {
      console.log('error in autenticateJWT')
      const err = createError(401)
      err.message = 'Access token invalid or not provided.'
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
  getImage (req, res, next) {
    console.log(req.body)
  }

  /**
   * Post image to Image service.
   *
   * @param {object} req - Express request object.
   * @param {object} res  - Express respons object.
   * @param {Function} next - Express next middleware function.
   */
  async postImage (req, res, next) {
    console.log('postimage')
    try {
      console.log(req.user) // req.body är bilden base64
      if (!req.body.data || !req.body.contentType) {
        throw new Error('image data and/or content type missing')
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
      res
        .status(201)

      console.log('ovanför fetcheddata')
      console.log(await fetchedData.json())
    } catch (error) {
      // Authentication failed.
      const err = createError(500)
      err.message = 'An unexpected condition was encountered.'
      next(err)
    }
  }
}
