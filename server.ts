import express from 'express'

import connectDB from './config/db'

import userRouter from './routes/api/users'
import authRouter from './routes/api/auth'
import postsRouter from './routes/api/posts'
import profileRouter from './routes/api/profile'

const app = express()
const PORT = process.env.PORT || 5000

connectDB()

app.get('/', (req, res) => {
  res.send('API running')
})

// Define Routes
app.use('/api/users', userRouter)
app.use('/api/auth', authRouter)
app.use('/api/profile', profileRouter)
app.use('/api/posts', postsRouter)

app.listen(PORT, () => console.log(`Running on ${PORT}`))
