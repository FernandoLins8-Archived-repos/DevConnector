import { Router, Request, Response } from 'express'
import { check, validationResult } from 'express-validator'
import { compare } from 'bcryptjs'
import jwt from 'jsonwebtoken'
import config from 'config'

import ensureAuthenticated from '../../middlewares/ensureAuthenticated'
import User from '../../models/User'

const authRouter = Router()

// @route   GET api/auth
// @desc    Get user By Token
// @access  Private
authRouter.get('/', ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user).select('-password')
    return res.json(user)

  } catch (err) {
    console.error(err.message)    
    return res.status(500).send('Server error')
  }
})

// @route   POST api/auth
// @desc    Authenticate user & get token
// @access  Public
authRouter.post('/', [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists()
], async (req: Request, res: Response) => {

  const errors = validationResult(req)

  if(!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const { email, password } = req.body

  try {
    // See if user exists
    const user = await User.findOne({ email })

    if(!user) {
      return res.status(400).json({ errors: [ { msg: 'Invalid Credentials' } ] })
    }

    const isMatch = await compare(password, user.password)

    if(!isMatch) {
      return res.status(401).json({ errors: [ { msg: 'Invalid Credentials' } ] })
    }

    const payload = {
      user: user.id
    }

    jwt.sign(payload, config.get('jwtSecret'), { expiresIn: 3600 },
    (err, token) => {
      if(err) throw err
      res.json({ token })
    })
    
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

export default authRouter
