// This module creates a test dataset to database

const { server } = require('../index')
const Blog = require('../models/blog')
const User = require('../models/user')
const { initialBlogs, createTestUser } = require('../tests/test_helper')

const createBlogTestDb = async () => {
  // remove all test users created in this module
  const testUsernames = ['Taru Testaaja', 'Toinen Testaaja']
  await User.remove({ name: testUsernames })
  await Blog.remove({ title: initialBlogs.map(blog => blog.title) })  // Empty test database

  const testUsers = []
  let aTestUser = await createTestUser(testUsernames[0], true)
  testUsers[0] = aTestUser
  aTestUser = await createTestUser(testUsernames[1], true)
  testUsers[1] = aTestUser

  // Initialize database with test data
  let testuserNo = 0
  const blogObjects = initialBlogs.map(n => {
    if (testuserNo<2) // every third blog-entry does not have a creator defined
      n.user = testUsers[testuserNo].id
    testuserNo = testuserNo === 2 ? 0 : testuserNo + 1
    return new Blog(n)
  })
  const blogs = await Promise.all(blogObjects.map(n => n.save()))

  // add test blog id to user entries
  const userPromises = testUsers.map(user => {
    user.blogs = blogs.reduce((userblogs, curr, i, blogs) => {
      if (user.id === blogs[i].user)
        userblogs.push(blogs[i]._id)
      return userblogs
    }, [])
    return User.findByIdAndUpdate(user.id, user, { new: true } )
  })

  await Promise.all(userPromises)

  await server.close(true)
  console.log('createBlogTestDb: server closed and dataset created')
}

createBlogTestDb()

module.exports = {
  createBlogTestDb
}