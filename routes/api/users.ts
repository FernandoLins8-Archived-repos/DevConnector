import express, { Request, Response } from 'express'
import { check, validationResult } from 'express-validator'
import gravatar from 'gravatar'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import config from 'config'

import User from '../../models/User'

const userRouter = express.Router()

// @route   POST api/users
// @desc    Register user
// @access  Public
userRouter.post('/', [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
], async (req: Request, res: Response) => {

  const errors = validationResult(req)

  if(!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const { name, email, password } = req.body

  try {
    // See if user exists
    const userExists = await User.findOne({ email })

    if(userExists) {
      return res.status(400).json({ errors: [ { msg: 'Email already registered' } ] })
    }

    // Get gravatar
    const avatar = gravatar.url(email, {
      s: '200',
      r: 'pg',
      d: 'mm'
    })

    // Hash password
    const salt = await bcryptjs.genSalt(10)
    const hashedPassword = await bcryptjs.hash(password, salt)
    const user = new User({
      name,
      email,
      avatar,
      password: hashedPassword
    })

    await user.save()

    // Return jsonwebtoken
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

export default userRouter
