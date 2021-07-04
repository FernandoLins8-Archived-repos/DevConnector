import express from 'express'

const userRouter = express.Router()

// @route   GET api/users
// @desc    Test route
// @access  Public
userRouter.get('/', (req, res) => res.send('User route'))

export default userRouter
