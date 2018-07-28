const supertest = require('supertest')
const { app, server } = require('../index')
const User = require('../models/user')
const api = supertest(app)
const { createTestUser } = require('./test_helper')

const testUsernames = []

describe('login tests', async () => {
  beforeEach(async () => {
  })

  test('login succeeds for an existing user', async () => {
    const aUser = await createTestUser('logintest1')
    testUsernames [0] = aUser.username

    const result = await api
      .post('/api/login')
      .send(aUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    //console.log(result.body.token)
    expect(result.body.token.length).toBeGreaterThan(0)
    expect(result.body.name).toBe(aUser.name)
    expect(result.body.username).toBe(aUser.username)
  })

  test('login fails for non-existing user', async () => {
    const aUser = {
      username: 'nonexisting'+Math.random()*1000000,
      name: 'nonexistinguser',
      password: 'sekret',
    }

    const result = await api
      .post('/api/login')
      .send(aUser)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    expect(result.body).toEqual({ error: 'invalid username or password' })
  })

  test('login fails if password is incorrect', async () => {
    const aUser = await createTestUser('logintest2')
    aUser.password = 'sekretX'
    testUsernames [1] = aUser.username

    const result = await api
      .post('/api/login')
      .send(aUser)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    expect(result.body).toEqual({ error: 'invalid username or password' })
  })
})

afterAll(async () => {
  // remove all test users used in this module test
  //console.log(testUsernames)
  await User.remove({ username: testUsernames })
  await server.close(true)
  //console.log('server closed in users.test.js')
})