require('dotenv').config()
const express = require('express')
const cors = require('cors')

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors({ origin: 'http://localhost:5173' }))
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
