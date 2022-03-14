import express from 'express'
import helmet from 'helmet'
import logger from 'morgan'
import { router } from './routes/router.js'
import { connectDB } from './config/mongoose.js'

try {
  await connectDB()

  const app = express()

  // Set various HTTP headers to make the application little more secure (https://www.npmjs.com/package/helmet).
  app.use(helmet())

  // Set up a morgan logger using the dev format for log entries.
  app.use(logger('dev'))

  // Parse requests of the content type application/json.
  // app.use(express.json())
  app.use(express.json({ limit: '500kb' }))

  // Register routes.
  app.use('/', router)
  app.use(function (err, req, res, next) {
    console.log('-----inside error in server.js-----')
    if (err.status === 400) {
      res.status(400).json({ status_code: 400, message: 'The request cannot or will not be processed due to something that is perceived to be a client error (for example, validation error.' })
    } else if (err.status === 401) {
      res.status(401).json({ status_code: 401, message: 'Access token invalid or not provided.' })
    } else if (err.status === 403) {
      res.status(403).json({ status_code: 403, message: 'The request contained valid data and was understood by the server, but the server is refusing action due to the authenticated user not having the necessary permissions for the resource.' })
    } else if (err.status === 404) {
      res.status(404).json({ status_code: 404, message: 'The requested resource was not found.' })
    } else if (err.status || err.status === 500) {
      res.status(500).json({ status_code: 500, message: 'An unexpected condition was encountered.' })
    }

    if (req.app.get('env') !== 'development') {
      return res
        .status(err.status)
        .json({
          status: err.status,
          message: err.message
        })
    }

    // Development only!
    // Only providing detailed error in development.
    /* return res
      .status(err.status)
      .json({
        status: err.status,
        message: err.message,
        cause: err.cause
          ? {
              status: err.cause.status,
              message: err.cause.message,
              stack: err.cause.stack
            }
          : null,
        stack: err.stack
      }) */
  })

  // Starts the HTTP server listening for connections.
  app.listen(process.env.PORT, () => {
    console.log(`Server running at http://localhost:${process.env.PORT}`)
    console.log('Press Ctrl-C to terminate...')
  })
} catch (err) {
  console.error(err)
  process.exitCode = 1
}
