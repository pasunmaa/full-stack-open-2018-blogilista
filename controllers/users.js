const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/',async (request, response) => {
  try {
    const blogs = await User.find({})
    response.json(blogs.map(User.format))
  }
  catch (error) {
    console.log('user list find failed', error)
    response.status(500).json({ error: 'user listing failed' })
  }
})

usersRouter.post('/', async (request, response) => {
  try {
    const body = request.body

    if (body.password.length < 3)
      return response.status(401).json({ error: 'invalid password' })

    body.adult = body.adult || true  // if adult is undefined, it's set true

    const existingUser = await User.find({ username: body.username })
    if (existingUser.length>0) {
      return response.status(400).json({ error: 'username must be unique' })
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(body.password, saltRounds)

    const user = new User({
      username: body.username,
      name: body.name,
      passwordHash,
      adult: body.adult,
    })

    const savedUser = await user.save()

    response.json(User.format(savedUser))
  }
  catch (exception) {
    console.log(exception)
    response.status(500).json({ error: 'user creation failed' })
  }
})

module.exports = usersRouter