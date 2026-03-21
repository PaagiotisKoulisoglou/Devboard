import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const protect = async (req, res, next) => {
  let token

  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) {
    const error = new Error('Not authorized — no token')
    error.statusCode = 401
    return next(error)
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET)

    req.user = await User.findById(decoded.id).select('-password')

    if (!req.user) {
      const error = new Error('User no longer exists')
      error.statusCode = 401
      return next(error)
    }

    next()
  } catch (err) {
    const error = new Error('Not authorized — token invalid or expired')
    error.statusCode = 401
    next(error)
  }
}

export default protect