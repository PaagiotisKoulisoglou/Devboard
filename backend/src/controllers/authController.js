import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import { generateAccessToken, generateRefreshToken } from '../utils/generateTokens.js'
import jwt from 'jsonwebtoken'

export const register = async (req, res) => {
  const { name, email, password } = req.body

  const existingUser = await User.findOne({ email })
  if (existingUser) {
    const error = new Error('Email already registered')
    error.statusCode = 400
    throw error
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  })

  const accessToken = generateAccessToken(user._id)
  generateRefreshToken(user._id, res) 

  res.status(201).json({
    success: true,
    accessToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  })
}

export const login = async (req, res) => {
  const { email, password } = req.body

  const user = await User.findOne({ email }).select('+password')

  if (!user) {
    const error = new Error('Invalid credentials')
    error.statusCode = 401
    throw error
  }

  const isMatch = await bcrypt.compare(password, user.password)

  if (!isMatch) {
    const error = new Error('Invalid credentials') 
    error.statusCode = 401
    throw error
  }

  const accessToken = generateAccessToken(user._id)
  generateRefreshToken(user._id, res)

  res.json({
    success: true,
    accessToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  })
}

export const refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken

  if (!token) {
    const error = new Error('Not authenticated')
    error.statusCode = 401
    throw error
  }

  let decoded
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET)
  } catch (err) {
    const error = new Error('Invalid or expired refresh token — please log in again')
    error.statusCode = 401
    throw error
  }

  const user = await User.findById(decoded.id)
  if (!user) {
    const error = new Error('User no longer exists')
    error.statusCode = 401
    throw error
  }

  const accessToken = generateAccessToken(user._id)

  res.json({
    success: true,
    accessToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  })
}

export const logout = (req, res) => {
  res.cookie('refreshToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(0), 
  })

  res.json({ success: true, message: 'Logged out successfully' })
}

export const getMe = async (req, res) => {
  const user = await User.findById(req.user.id)

  if (!user) {
    const error = new Error('User not found')
    error.statusCode = 404
    throw error
  }

  res.json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      createdAt: user.createdAt,
    },
  })
}