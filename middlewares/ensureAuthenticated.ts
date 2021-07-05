import jwt from 'jsonwebtoken'
import config from 'config'
import { Request, Response, NextFunction } from 'express'

interface IPayload {
    user: string
}

export default function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
  const token = req.header('x-auth-token')

  if(!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' })
  }

  try {
    const decoded = jwt.verify(token, config.get('jwtSecret')) as IPayload
    req.user = decoded.user
    next()
    
  } catch(err) {
    res.status(401).json({ msg: 'Token is not valid' })
  }
}
