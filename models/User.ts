import { Schema, model } from 'mongoose'

interface IUser {
  name: string
  email: string
  password: string
  avatar: string
  date: string
}

const User = model<IUser>('user', new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  avatar: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now()
  }
}))
  
export default User
