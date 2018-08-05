const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')

loginRouter.post('/', async (request, response) => {
  const body = request.body

  const user = await User.findOne({ username: body.username })
  const passwordCorrect = user === null ?
    false :
    await bcrypt.compare(body.password, user.passwordHash)

  if ( !(user && passwordCorrect) ) {
    return response.status(401).send({ error: 'invalid username or password' })
  }

  const userForToken = {
    username: user.username,
    id: user._id
  }

  let secret = 'Secret'
  if (process.env.SECRET)
    secret = process.env.SECRET
  else
    secret += (Math.random()*100000000).toFixed(0)
  const token = jwt.sign(userForToken, secret)

  response.status(200).send({ token, username: user.username, name: user.name })
})

module.exports = loginRouter