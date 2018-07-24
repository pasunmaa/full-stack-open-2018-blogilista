const supertest = require('supertest')
const { app, server } = require('../index')
const Blog = require('../models/blog')
const api = supertest(app)
const { format, initialNotes, nonExistingId, notesInDb } = require('./test_helper')

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

    test('there are five notes', async () => {
      const response = await api
        .get('/api/blogs')

      expect(response.body.length).toBe(9)
    })

    test('the first blogs title is Kalle\'s blog', async () => {
      const response = await api
        .get('/api/blogs')

      expect(response.body[0].title).toBe('Kalle\'s blog')
    })
  })
})

afterAll(() => {
  server.close()
})