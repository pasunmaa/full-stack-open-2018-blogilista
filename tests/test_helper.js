const bcrypt = require('bcrypt')
const Blog = require('../models/blog')
const User = require('../models/user')
const supertest = require('supertest')
const { app } = require('../index')
const api = supertest(app)


const initialBlogs = [
  {
    _id: '5a422a851b54a676234d17f7',
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7,
    __v: 0
  },
  {
    _id: '5a422aa71b54a676234d17f8',
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
    __v: 0
  },
  {
    _id: '5a422b3a1b54a676234d17f9',
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 12,
    __v: 0
  },
  {
    _id: '5a422b891b54a676234d17fa',
    title: 'First class tests',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
    likes: 10,
    __v: 0
  },
  {
    _id: '5a422ba71b54a676234d17fb',
    title: 'TDD harms architecture',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
    likes: 0,
    __v: 0
  },
  {
    _id: '5a422bc61b54a676234d17fc',
    title: 'Type wars',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
    likes: 2,
    __v: 0
  }
]

const nonExistingId = async () => {
  const blog = new Blog()
  await blog.save()
  await blog.remove()

  return blog._id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(Blog.format)
}

const usersInDb = async () => {
  const users = await User.find({})
  return users
}

const tokenForUser = async (user) => {
  if (!user) {
    const aUser = {
      username: 'temp',
      name: 'Tilapäinen Käyttäjä',
      password: 'sekret',
    }
    user = aUser
  }
  const result = await api
    .post('/api/login')
    .send(user)

  if (result.status === 200)
    return result.body.token
  else
    return null
}

const createTestUser = async (name) => {
  const password = 'sekret'
  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)
  const random = Math.random()*1000000
  const user = new User({
    username: 'testuser' + random,
    name: name + random,
    passwordHash }
  )
  const createdUser = await user.save()
  return { username: createdUser.username, name: createdUser.name, password: password, id: createdUser._id }
}

module.exports = {
  initialBlogs, nonExistingId, blogsInDb, usersInDb, createTestUser, tokenForUser
}