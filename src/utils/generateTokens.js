import jwt from 'jsonwebtoken'

export const generateAccessToken = (userId) => {
  return jwt.sign(
    { id: userId },                          
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRE }  
  )
}


export const generateRefreshToken = (userId, res) => {
  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE } 
  )



  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, 
  })

  return refreshToken
}