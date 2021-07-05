import { Router, Request, Response } from 'express'
import { check, validationResult } from 'express-validator'

import ensureAuthenticated from '../../middlewares/ensureAuthenticated'
import Profile from '../../models/Profile'

const profileRouter = Router()

// @route   GET api/profile/me
// @desc    Get current user profile
// @access  Private
profileRouter.get('/me', ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const profile = await Profile.findOne({ user: req.user }).populate('user', ['name', 'avatar'])

    if(!profile) {
      return res.status(400).json({ msg: 'There is no profile for this user' })
    }

    res.json(profile)
    
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
  
  res.send('Profile route')
})

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


export default profileRouter
