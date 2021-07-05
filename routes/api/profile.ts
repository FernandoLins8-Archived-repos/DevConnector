import { Router, Request, Response } from 'express'
import { check, validationResult } from 'express-validator'
import axios from 'axios'
import config from 'config'

import ensureAuthenticated from '../../middlewares/ensureAuthenticated'
import Profile from '../../models/Profile'
import User from '../../models/User'

const profileRouter = Router()

// @route   POST api/profile
// @desc    Create or update user profile
// @access  Private
profileRouter.post('/', ensureAuthenticated, [
  check('status', 'Status is required').not().isEmpty(),
  check('skills', 'Skills are required').not().isEmpty()
], async (req: Request, res: Response) => {

  const errors = validationResult(req)

  if(!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const {
    company,
    website,
    location,
    bio,
    status,
    githubusername,
    skills,
    youtube,
    facebook,
    twitter,
    instagram,
    linkedin
  } = req.body

  // Build profile object
  const profileFields = {
    user: req.user,
    company,
    website,
    location,
    bio,
    status,
    githubusername,
    skills,
    social: {
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin
    },
  }

  if(skills) {
    profileFields.skills = skills.split(',')
      .map((skill: string) => skill.trim())
      .filter((skill: string) => skill.length > 0)
  }
  
  try {
    let profile = await Profile.findOne({ user: req.user })

    if(profile) {
      profile = await Profile.findOneAndUpdate(
        { user: req.user }, 
        profileFields,
        { new: true })

      return res.json(profile)
    }
    
    profile = new Profile(profileFields)
    await profile.save()
    return res.json(profile)
      
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
  
  res.send('Profile route')
})

// @route   PUT api/profile/experience
// @desc    Add Profile experience
// @access  Private
profileRouter.put('/experience', ensureAuthenticated, [
  check('title', 'Title is required').not().isEmpty(),
  check('company', 'Company is required').not().isEmpty(),
  check('from', 'From date is required').not().isEmpty(),
], async (req: Request, res: Response) => {

  const errors = validationResult(req)

  if(!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const {
    title,
    company,
    location,
    from,
    to,
    current,
    description
  } = req.body

  const newExp = {
    title,
    company,
    location,
    from,
    to,
    current,
    description
  }

  try {
    const profile = await Profile.findOne({ user: req.user })

    if(!profile) {
      return res.status(400).json({ msg: 'Profile not found' })
    }

    profile.experience.unshift(newExp)
    await profile.save()
    return res.json(profile)

  } catch(err) {
    console.error(err.message)
    return res.status(500).send('Server Error')
  }
})

// @route   DELETE api/profile/experience/:exp_id
// @desc    Delete experience from profile
// @access  Private
profileRouter.delete('/experience/:id', ensureAuthenticated, async(req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user })

    if(!profile) {
      return res.status(400).json({ 'msg': 'Profile not found' })
    }

    const removeIndex = profile.experience.map(item => item._id).indexOf(req.params.id)
    profile.experience.splice(removeIndex, 1)
    await profile.save()
    return res.json(profile)

  } catch(err) {
    console.error(err.message)
    return res.status(500).send('Server Error')
  }
})

// @route   PUT api/profile/education
// @desc    Add Profile education
// @access  Private
profileRouter.put('/education', ensureAuthenticated, [
  check('school', 'School is required').not().isEmpty(),
  check('degree', 'Degree is required').not().isEmpty(),
  check('from', 'From date is required').not().isEmpty(),
  check('fieldofstudy', 'Field of Study date is required').not().isEmpty(),
], async (req: Request, res: Response) => {

  const errors = validationResult(req)

  if(!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const {
    school,
    degree,
    fieldofstudy,
    from,
    to,
    current,
    description
  } = req.body

  const newEdu = {
    school,
    degree,
    fieldofstudy,
    from,
    to,
    current,
    description
  }

  try {
    const profile = await Profile.findOne({ user: req.user })

    if(!profile) {
      return res.status(400).json({ msg: 'Profile not found' })
    }

    profile.education.unshift(newEdu)
    await profile.save()
    return res.json(profile)

  } catch(err) {
    console.error(err.message)
    return res.status(500).send('Server Error')
  }
})

// @route   DELETE api/profile/education/:edu_id
// @desc    Delete education from profile
// @access  Private
profileRouter.delete('/education/:id', ensureAuthenticated, async(req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user })

    if(!profile) {
      return res.status(400).json({ 'msg': 'Profile not found' })
    }

    const removeIndex = profile.education.map(item => item._id as string).indexOf(req.params.id)
    profile.education.splice(removeIndex, 1)
    await profile.save()
    return res.json(profile)

  } catch(err) {
    console.error(err.message)
    return res.status(500).send('Server Error')
  }
})

// @route   GET api/profile/me
// @desc    Get current user profile
// @access  Private
profileRouter.get('/me', ensureAuthenticated, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user }).populate('user', ['name', 'avatar'])

    if(!profile) {
      return res.status(400).json({ msg: 'There is no profile for this user' })
    }

    return res.json(profile)
    
  } catch (err) {
    console.error(err.message)
    return res.status(500).send('Server Error')
  }
})

// @route   GET api/profile
// @desc    Get all profiles
// @access  Public
profileRouter.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar'])
    return res.json(profiles)

  } catch(err) {
    console.error(err.message)
    return res.status(500).send('Server error')
  }
})

// @route   GET api/profile/user/:user_id
// @desc    Get profile by user ID
// @access  Public
profileRouter.get('/user/:id', async (req, res) => {
  try {
    const id = req.params.id
    const profile = await Profile.findOne({ _id: id }).populate('user', ['name', 'avatar'])

    if(!profile) {
      return res.status(400).json({ 'msg': 'Profile not found'})
    }
  
    return res.json(profile)

  } catch(err) {
    console.error(err.message)
    if(err.kind == 'ObjectId') {
      return res.status(400).json({ 'msg': 'Profile not found'})
    }
    return res.status(500).send('Server error')
  }
})

// @route   GET api/profile/github/:username
// @desc    Get user repos from Github
// @access  Public
profileRouter.get('/github/:username', async(req, res) => {
  try {
    const uri = `https://api.github.com/users/${req.params.username}/repos?per_page=5&client_id=${config.get('githubClientId')}&client_secret=${config.get('githubSecret')}`

    const headers = { 'user-agent': 'node.js' }
    const axiosResponse = await axios.get(uri, { headers })

    return res.json(axiosResponse.data)

  } catch(err) {
    console.error(err.message)
    return res.status(404).json({ msg: 'No Github profile found' })
  }
})

// @route   DELETE api/profile
// @desc    Delete profile, user & posts
// @access  Private
profileRouter.delete('/', ensureAuthenticated, async (req, res) => {
  try {
    // @todo - remove users posts

    await Profile.findOneAndRemove({ user: req.user })
    await User.findOneAndRemove({ _id: req.user })

    return res.json({ 'msg': 'User removed' })

  } catch(err) {
    console.error(err.message)
    return res.status(500).send('Server error')
  }
})

export default profileRouter
