import { Router, Request, Response } from 'express'
import { check, validationResult } from 'express-validator'

import ensureAuthenticated from '../../middlewares/ensureAuthenticated'
import User from '../../models/User'
import Post from '../../models/Post'

const postsRouter = Router()

// @route   POST api/posts
// @desc    Create a post
// @access  Private
postsRouter.post('/', ensureAuthenticated, [
  check('text', 'Text is required').not().isEmpty()
], async (req: Request, res: Response) => {

  const errors = validationResult(req)

  if(!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  try {
    const user = await User.findOne({ _id: req.user }).select('-password')

    if(!user) {
      return res.status(401).json({ msg: 'User not found' })
    }

    const post = new Post({
      text: req.body.text,
      name: user.name,
      avatar: user.avatar,
      user: req.user
    })

    await post.save()
    return res.json(post)

  } catch(err) {
    console.error(err.message)
    return res.status(500).send('Server Error')
  }
})

// @route   Get api/posts
// @desc    Get all posts
// @access  Private
postsRouter.get('/', ensureAuthenticated, async (req, res) => {
  try {
    const posts = await Post.find()
    return res.json(posts)

  } catch(err) {
    console.error(err.message)
    return res.status(500).send('Server Error')
  }
})

// @route   Get api/posts/:post_id
// @desc    Get post by Id
// @access  Private
postsRouter.get('/:id', ensureAuthenticated, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)

    if(!post) {
      return res.status(404).json({ msg: 'Post not found' })
    }

    return res.json(post)

  } catch(err) {
    console.error(err.message)
    if(err.kind == 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' })
    }
    return res.status(500).send('Server Error')
  }
})

// @route   Delete api/posts/:post_id
// @desc    Delete post by Id
// @access  Private
postsRouter.delete('/:id', ensureAuthenticated, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)

    if(!post) {
      return res.status(404).json({ msg: 'Post not found' })
    }
    
    if(post.user.toString() !== req.user) {
      return res.status(401).json({ msg: 'Unauthorized' })
    }
    
    await post.remove()
    return res.json({ msg: 'Post Removed' })

  } catch(err) {
    console.error(err.message)
    if(err.kind == 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' })
    }
    return res.status(500).send('Server Error')
  }
})

// @route   Put api/posts/like/:post_id
// @desc    Like (or dislike) post by Id
// @access  Private
postsRouter.put('/like/:id', ensureAuthenticated, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)

    if(!post) {
      return res.status(404).json({ msg: 'Post not found' })
    }

    const removeIndex = post.likes.indexOf(req.user)
    
    if(removeIndex !== -1) {
      post.likes.splice(removeIndex, 1)
    } else {
      post.likes.unshift(req.user)
    }
    
    post.save()
    return res.json(post)

  } catch(err) {
    console.error(err.message)
    return res.status(500).send('Server Error')
  }
})

// @route   POST api/posts/comment/:post_id
// @desc    Comment on a post
// @access  Private
postsRouter.post('/comment/:id', ensureAuthenticated, [
  check('text', 'Text is required').not().isEmpty()
], async (req: Request, res: Response) => {

  const errors = validationResult(req)

  if(!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  try {
    const user = await User.findOne({ _id: req.user }).select('-password')

    if(!user) {
      return res.status(401).json({ msg: 'Unauthorized' })
    }

    const post = await Post.findById(req.params.id)

    if(!post) {
      return res.status(401).json({ msg: 'Post not found' })
    }

    const newComment = {
      user: req.user,
      name: user.name,
      avatar: user.avatar,
      text: req.body.text
    }

    post.comments.unshift(newComment)
    await post.save()
    return res.json(post)

  } catch(err) {
    console.error(err.message)
    return res.status(500).send('Server Error')
  }
})

// @route   Delete api/posts/comment/:post_id/:comment_id
// @desc    Delete a comment
// @access  Private
postsRouter.delete('/comment/:post_id/:comment_id', ensureAuthenticated, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id)

    if(!post) {
      return res.status(400).json({ msg: 'Post not found' })
    }
  
    // Get comment index
    const removeIndex = post.comments
    .map(comment => comment._id)
    .indexOf(req.params.comment_id)
                            
    if(removeIndex === -1) {
      return res.status(400).json({ msg: 'Comment not found' })
    }

    // If auth user isn't post owner or comment owner he cannot delete the comment 
    if(post.user.toString() !== req.user && 
    post.comments[removeIndex].user.toString() !== req.user) {
      return res.status(401).json({ msg: 'Unauthorized' })
    }
  
    post.comments.splice(removeIndex, 1)
    post.save()
    return res.json(post.comments)

  } catch(err) {
    console.error(err.message)
    return res.status(500).send('Server Error')
  }
})

export default postsRouter
