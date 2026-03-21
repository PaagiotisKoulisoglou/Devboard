import { z } from 'zod/v4'

export const registerSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name too long'),

  email: z.email('Please provide a valid email'),

  password: z
    .string({ required_error: 'Password is required' })
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password too long'),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),  
  password: z.string().min(1, 'Password is required'),
})