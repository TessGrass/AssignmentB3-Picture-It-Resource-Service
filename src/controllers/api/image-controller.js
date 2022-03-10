
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
      console.log('inside try i athenticateJWT')
      const jwtPayload = jwt.verify(authorization[1], publicKey)
      req.user = {
        email: jwtPayload.email,
        username: jwtPayload.username,
        id: jwtPayload.id
      }
      console.log(jwtPayload)
    } catch (error) {
      console.log('error in autenticateJWT')
      const err = createError(401)
      err.message = 'Access token invalid or not provided.'
      console.log(error)
      next(err)
    }
  }
}
