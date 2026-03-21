import 'express-async-errors' 
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'  
import connectDB from './config/db.js'
import './models/index.js'      
import taskRoutes from './routes/taskRoutes.js'
import errorHandler from './middleware/errorHandler.js'
import authRoutes from './routes/authRoutes.js'  


dotenv.config()
 
const app = express()

connectDB()

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}))

app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cookieParser())

app.get('/api/health', (req, res) => {
  res.json({status: 'ok', timestamp: new Date().toISOString()})
})


app.use('/api/auth', authRoutes)
app.use('/api/tasks', taskRoutes)

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.url} not found` })
})

app.use(errorHandler)


const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
})