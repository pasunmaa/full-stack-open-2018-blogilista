const supertest = require('supertest')
const { app, server } = require('../index')
const Blog = require('../models/blog')
const api = supertest(app)
const { initialBlogs, nonExistingId, blogsInDb } = require('./test_helper')

describe('when there is initially some blogs saved', async () => {
/*   beforeAll(async () => {
    await Blog.remove({})  // Empty test database

    const noteObjects = initialNotes.map(n => new Blog(n))
    await Promise.all(noteObjects.map(n => n.save()))
  }) */

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

    test('the first blogs title is Kalle\'s blog', async () => {
      const response = await api
        .get('/api/blogs')

      expect(response.body[0].title).toBe('Kalle\'s blog')
    })
  })

  describe.only('valid blog entries can be added', async () => {
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
})

afterAll(() => {
  server.close()
})