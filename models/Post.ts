import { Schema, model } from 'mongoose'

interface IPost {
  _id?: string
  user: string
  text: string
  name: string
  avatar: string
  likes: [
    user: string
  ]
  comments: [
    {
      _id?: string
      user: string
      name: string
      avatar: string
      text: string
      date?: Date
    }
  ]
}

const Post = model<IPost>('post', new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user'
  },
  text: {
    type: String,
    required: true
  },
  name: {
    type: String,
  },
  avatar: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now()
  },
  likes: [String],
  comments: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: 'user'
      },
      name: {
        type: String
      },
      avatar: {
        type: String
      },
      text: {
        type: String,
        required: true
      },
      date: {
        type: Date,
        default: Date.now()
      }
    }
  ]
}))

export default Post
