const supertest = require('supertest')
const { app, server } = require('../index')
const Blog = require('../models/blog')
const api = supertest(app)
const User = require('../models/user')
const { initialBlogs, nonExistingId, blogsInDb, usersInDb } = require('./test_helper')

describe('when there is initially some blogs saved', async () => {
  beforeAll(async () => {
    await Blog.remove({})  // Empty test database

    // create a user, if none exist
    let testuserid = ''
    const users = await usersInDb()
    if (users.length === 0) {
      const user = new User({ username: 'temp', password: 'sekret', adult: true })
      const testuser = await user.save()
      testuserid = testuser.id
    }
    else
      testuserid = users[0].id

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
      const newBlog = {
        title: 'Vapaan kassavirran malli osakkeen arvonmäärityksessä',
        author: 'Random Walker',
        url: 'https://blogi.nordnet.fi/vapaan-kassavirran-malli-osakkeen-arvonmaarityksessa/',
        likes: 1
      }

      const beforeBlogs = await blogsInDb()

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      const allBlogs = await blogsInDb()
      //console.log(allBlogs)
      const titles = allBlogs.map(r => r.title)
      //console.log(titles)


      expect(allBlogs.length).toBe(beforeBlogs.length + 1)
      expect(titles).toContain(newBlog.title)
    })

    test('if likes in a new blog is not set, it\'s set to 0', async () => {
      const newBlog = {
        title: 'Vapaan kassavirran malli osakkeen arvonmäärityksessä',
        author: 'Random Walker',
        url: 'https://blogi.nordnet.fi/vapaan-kassavirran-malli-osakkeen-arvonmaarityksessa/'//,
        //likes: 1
      }

      const newSavedBlog = await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      expect(newSavedBlog.body.likes).toBe(0)
    })

    test('if title and url in a new blog are missing, response is 400 Bad request', async () => {
      const newBlog = {
        //title: 'Vapaan kassavirran malli osakkeen arvonmäärityksessä',
        author: 'Random Walker',
        //url: 'https://blogi.nordnet.fi/vapaan-kassavirran-malli-osakkeen-arvonmaarityksessa/',
        likes: 10
      }

      await api
        .post('/api/blogs')
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

/*   afterAll(() => {
    server.close()
  }) */
})

describe('delete', async () => {
  test('a blog can be deleted', async () => {
    const newBlog = {
      title: 'Node.js, MongoDB & Express: Simple Add, Edit, Delete, View',
      author: 'Mukesh Chapagain',
      url: 'http://blog.chapagain.com.np/node-js-express-mongodb-simple-add-edit-delete-view-crud/',
      likes: 101
    }

    const addedBlog = await api
      .post('/api/blogs')
      .send(newBlog)

    const blogsBefore = await blogsInDb()

    await api
      .delete(`/api/blogs/${addedBlog.body.id}`)
      .expect(204)

    const blogsAfterDelete = await blogsInDb()

    const titles = blogsAfterDelete.map(blog => blog.title)

    expect(titles).not.toContain(newBlog.title)
    expect(blogsAfterDelete.length).toBe(blogsBefore.length - 1)
  })

  test('deleting an non-existing blog returns 404', async () => {

    await api
      .delete(`/api/blogs/${await nonExistingId()}`)
      .expect(404)
  })
})


afterAll(async () => {
  await server.close(true)
  //console.log('server closed in blogs.test.js')
})