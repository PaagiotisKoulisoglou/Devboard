import express from 'express'
import {
  register,
  login,
  refreshToken,
  logout,
  getMe,
} from '../controllers/authController.js'
import protect from '../middleware/protect.js'
import validate from '../middleware/validate.js'
import { authLimiter } from '../middleware/rateLimiter.js'
import { registerSchema, loginSchema } from '../utils/validators.js'

const router = express.Router()

router.post('/register', authLimiter, validate(registerSchema), register)
router.post('/login',    authLimiter, validate(loginSchema),    login)
router.post('/refresh',  refreshToken)
router.post('/logout',   logout)

router.get('/me', protect, getMe)

export default router