//const bcrypt = require('bcrypt')
const supertest = require('supertest')
const { app, server } = require('../index')
const Blog = require('../models/blog')
const api = supertest(app)
const User = require('../models/user')
const { initialBlogs, nonExistingId, blogsInDb, createTestUser, tokenForUser } = require('./test_helper')

const testUsernames = []
let aTestUser = null
describe('when there is initially some blogs saved', async () => {
  beforeAll(async () => {
    await Blog.remove({})  // Empty test database

    aTestUser = await createTestUser('blogtest1')
    testUsernames [0] = aTestUser.username
    console.log(aTestUser)
    const testuserid = aTestUser.id

    // Initialize database with test data
    const blogObjects = initialBlogs.map(n => {
      n.user = testuserid
      return new Blog(n)
    })
    await Promise.all(blogObjects.map(n => n.save()))
  })

  describe('get blogs tests', () => {
    test('blogs are returned as json', async () => {
      await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
    })

    test('there are blogs', async () => {
      const beforeBlogs = await blogsInDb()
      const response = await api
        .get('/api/blogs')

      expect(response.body.length).toBe(beforeBlogs.length)
    })

    test(`the first blogs title is ${initialBlogs[0].title}`, async () => {
      const response = await api
        .get('/api/blogs')

      expect(response.body[0].title).toBe(initialBlogs[0].title)
    })
  })

  describe('valid blog entries can be added', async () => {
    test('a valid blog can be added ', async () => {
      const validToken = await tokenForUser(aTestUser)

      const newBlog = {
        title: 'Vapaan kassavirran malli osakkeen arvonmäärityksessä',
        author: 'Random Walker',
        url: 'https://blogi.nordnet.fi/vapaan-kassavirran-malli-osakkeen-arvonmaarityksessa/',
        likes: 1
      }

      const beforeBlogs = await blogsInDb()

      await api
        .post('/api/blogs')
        .set('Authorization', 'bearer ' + validToken)
        .send(newBlog)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      const allBlogs = await blogsInDb()
      const titles = allBlogs.map(r => r.title)

      expect(allBlogs.length).toBe(beforeBlogs.length + 1)
      expect(titles).toContain(newBlog.title)
    })

    test('if likes in a new blog is not set, it\'s set to 0', async () => {
      const validToken = await tokenForUser(aTestUser)

      const newBlog = {
        title: 'Vapaan kassavirran laskenta',
        author: 'Cursor',
        url: 'https://www.cursor.fi/fi/vapaan-kassavirran-laskenta'//,
        //likes: 1
      }

      const newSavedBlog = await api
        .post('/api/blogs')
        .set('Authorization', 'bearer ' + validToken)
        .send(newBlog)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      expect(newSavedBlog.body.likes).toBe(0)
    })

    test('if title and url in a new blog are missing, response is 400 Bad request', async () => {
      const validToken = await tokenForUser(aTestUser)
      const newBlog = {
        //title: 'Vapaan kassavirran malli osakkeen arvonmäärityksessä',
        author: 'Random Walker',
        //url: 'https://blogi.nordnet.fi/vapaan-kassavirran-malli-osakkeen-arvonmaarityksessa/',
        likes: 10
      }

      await api
        .post('/api/blogs')
        .set('Authorization', 'bearer ' + validToken)
        .send(newBlog)
        .expect(400)
        .expect('Content-Type', /application\/json/)
    })
  })

  describe('blog update', async () => {
    test('an existing blog can be updated', async () => {
      const blogsBefore = await blogsInDb()
      const likesBeforeUpdate = blogsBefore[0].likes++

      const updatedBlog = await api
        .put(`/api/blogs/${blogsBefore[0].id}`)
        .send(blogsBefore[0])
        .expect(200)
        .expect('Content-Type', /application\/json/)

      expect(updatedBlog.body.likes).toBe(likesBeforeUpdate + 1)
    })

    test('updating a non-existing blog returns 404', async () => {
      const response = await api
        .put(`/api/blogs/${await nonExistingId()}`)
        .expect(404)

      expect(response.body.error).toBe('failed to udpate non-existing blog')
    })
  })

  describe('delete', async () => {
    test('a blog can be deleted when creator deletes it', async () => {
      const newBlog = {
        title: 'Node.js, MongoDB & Express: Simple Add, Edit, Delete, View',
        author: 'Mukesh Chapagain',
        url: 'http://blog.chapagain.com.np/node-js-express-mongodb-simple-add-edit-delete-view-crud/',
        likes: 101
      }
      //console.log(aTestUser)
      const validToken = await tokenForUser(aTestUser)

      const addedBlog = await api
        .post('/api/blogs')
        .set('Authorization', 'bearer ' + validToken)
        .send(newBlog)

      const blogsBefore = await blogsInDb()

      await api
        .delete(`/api/blogs/${addedBlog.body.id}`)
        .set('Authorization', 'bearer ' + validToken)
        .expect(204)

      const blogsAfterDelete = await blogsInDb()

      const titles = blogsAfterDelete.map(blog => blog.title)

      expect(titles).not.toContain(newBlog.title)
      expect(blogsAfterDelete.length).toBe(blogsBefore.length - 1)
    })

    test('a blog can be deleted when creator is not defined', async () => {
      const newBlog = {
        title: 'Node.js, MongoDB & Express: Simple Add, Edit, Delete, View',
        author: 'Mukesh Chapagain',
        url: 'http://blog.chapagain.com.np/node-js-express-mongodb-simple-add-edit-delete-view-crud/',
        likes: 88
      }
      const validToken = await tokenForUser(aTestUser)

      // add a blog to db without creator
      const blog = new Blog(newBlog)
      const addedBlog = await blog.save()

      const blogsBefore = await blogsInDb()

      await api
        .delete(`/api/blogs/${addedBlog._id}`)
        .set('Authorization', 'bearer ' + validToken)
        .expect(204)

      const blogsAfterDelete = await blogsInDb()

      const titles = blogsAfterDelete.map(blog => blog.title)

      expect(titles).not.toContain(newBlog.title)
      expect(blogsAfterDelete.length).toBe(blogsBefore.length - 1)
    })

    test('a blog created by another user cannot be deleted, returns 401 unauthorized', async () => {
      const anotherTestUser = await createTestUser('blogtest2')
      testUsernames [1] = anotherTestUser.username

      const newBlog = {
        title: 'Supporting Jest Open Source',
        author: 'Rick Hanlon',
        url: 'https://jestjs.io/blog/',
        likes: 99
      }

      const validToken = await tokenForUser(aTestUser)
      const addedBlog = await api
        .post('/api/blogs')
        .set('Authorization', 'bearer ' + validToken)
        .send(newBlog)

      const blogsBefore = await blogsInDb()

      const validToken2 = await tokenForUser(anotherTestUser)
      await api
        .delete(`/api/blogs/${addedBlog.body.id}`)
        .set('Authorization', 'bearer ' + validToken2)
        .expect(401)

      const blogsAfterDelete = await blogsInDb()

      const titles = blogsAfterDelete.map(blog => blog.title)

      expect(titles).toContain(newBlog.title)
      expect(blogsAfterDelete.length).toBe(blogsBefore.length)
    })

    test('deleting an non-existing blog returns 404', async () => {
      const validToken = await tokenForUser(aTestUser)

      await api
        .delete(`/api/blogs/${await nonExistingId()}`)
        .set('Authorization', 'bearer ' + validToken)
        .expect(404)
    })
  })
})

afterAll(async () => {
  // remove all test users created in this module test
  await User.remove({ username: testUsernames })
  await Blog.remove({})  // Empty test blog database
  await server.close(true)
  //console.log('server closed in blogs.test.js')
})