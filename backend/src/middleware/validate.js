const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body)
  
    if (!result.success) {
      const messages = result.error.issues  
        .map((e) => e.message)
        .join(', ')
  
      const error = new Error(messages)
      error.statusCode = 400
      return next(error)
    }
  
    req.body = result.data
    next()
  }
  
  export default validate