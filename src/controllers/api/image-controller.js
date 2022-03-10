
import jwt from 'jsonwebtoken'
import createError from 'http-errors'
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
      console.log(error)
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
    console.log()
  }

  /**
   * Post image to Image service.
   *
   * @param {object} req - Express request object.
   * @param {object} res  - Express respons object.
   * @param {Function} next - Express next middleware function.
   */
  async postImage (req, res, next) {
    console.log(req.user)
    
  }
}
