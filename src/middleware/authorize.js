const authorize = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      const error = new Error(
        `Role '${req.user.role}' is not authorized to access this route`
      )
      error.statusCode = 403
      return next(error)
    }
    next()
  }
  
  export default authorize