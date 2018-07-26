const bcrypt = require('bcrypt')
const supertest = require('supertest')
const { app, server } = require('../index')
const User = require('../models/user')
const api = supertest(app)

describe.only('login with one user at db', async () => {
  beforeAll(async () => {
    await User.remove({})
    const saltRounds = 10
    const passwordHash = await bcrypt.hash('sekret', saltRounds)
    const user = new User({ username: 'root', name: 'Juuri Käyttäjä', passwordHash, adult: true })
    await user.save()
  })

  test('login succeeds for root-user', async () => {
    const aUser = {
      username: 'root',
      name: 'Juuri Käyttäjä',
      password: 'sekret',
    }

    const result = await api
      .post('/api/login')
      .send(aUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(result.body.token.length).toBeGreaterThan(0)
    expect(result.body.name).toBe(aUser.name)
    expect(result.body.username).toBe(aUser.username)
  })

  test('login fails for non-existing user', async () => {
    const aUser = {
      username: 'nonexisting'+Math.random()*1000000,
      name: 'Superuser',
      password: 'sekret',
    }
    console.log(aUser.username)

    const result = await api
      .post('/api/login')
      .send(aUser)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    expect(result.body).toEqual({ error: 'invalid username or password' })
  })

  test('login fails if password is incorrect', async () => {
    const aUser = {
      username: 'root',
      name: 'Superuser',
      password: 'sekretX',
    }

    const result = await api
      .post('/api/login')
      .send(aUser)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    expect(result.body).toEqual({ error: 'invalid username or password' })
  })
})

afterAll(async () => {
  await server.close(true)
  //console.log('server closed in users.test.js')
})