const authorize = (...roles) => (req, res, next) => {
    if (!req.user) {
      const error = new Error('Not authorized — authentication required')
      error.statusCode = 401
      return next(error)
    }
  
    if (!roles.includes(req.user.role)) {
      const error = new Error(`Role '${req.user.role}' is not authorized to access this route`)
      error.statusCode = 403
      return next(error)
    }
    return next()
  }
  
  export default authorize