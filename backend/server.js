require('dotenv').config()
const express = require('express')
const cors = require('cors')

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://readymed.netlify.app',
]
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., mobile apps, curl, Postman)
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) {
      return callback(null, true)
    }
    return callback(new Error(`CORS policy: Origin ${origin} not allowed`))
  },
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Routes
app.use('/api/users', require('./routes/users'))
app.use('/api/companies', require('./routes/companies'))
app.use('/api/jobs', require('./routes/jobs'))
app.use('/api/applications', require('./routes/applications'))

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'ReadyMD API is running' })
})

app.listen(PORT, () => {
  console.log(`🚀 ReadyMD backend running at http://localhost:${PORT}`)
})
