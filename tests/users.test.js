const supertest = require('supertest')
const { app, server } = require('../index')
const User = require('../models/user')
const api = supertest(app)
const { nonExistingId, usersInDb } = require('./test_helper')

describe.only('when there is initially one user at db', async () => {
  beforeAll(async () => {
    await User.remove({})
    const user = new User({ username: 'root', password: 'sekret', adult: true })
    await user.save()
  })

  test('POST /api/users fails with proper statuscode and message if username already taken', async () => {
    const usersBeforeOperation = await usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen',
      adult: false
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body).toEqual({ error: 'username must be unique' })

    const usersAfterOperation = await usersInDb()
    expect(usersAfterOperation.length).toBe(usersBeforeOperation.length)
  })

  test('Creating a user without setting adult, set adult to true', async () => {
    const newUser = {
      username: 'anothernewuser',
      name: 'Anoter User',
      password: 'salainen'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(result.body.adult).toBe(true)
  })

  test('Creating a user fails with 401 invalid password, if password is shorter than 3 chars', async () => {
    const newUser = {
      username: 'anewuser',
      name: 'Anew User',
      password: 'sa',
      adult: true
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    expect(result.body).toEqual({ error: 'invalid password' })
  })

  test('POST /api/users succeeds with a fresh username', async () => {
    const usersBeforeOperation = await usersInDb()

    const newUser = {
      username: 'pasunmaa',
      name: 'Petri Asunmaa',
      password: 'salainen',
      adult: true
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const usersAfterOperation = await usersInDb()
    expect(usersAfterOperation.length).toBe(usersBeforeOperation.length+1)
    const usernames = usersAfterOperation.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })

})

afterAll(async () => {
  await server.close(true)
  //console.log('server closed in users.test.js')
})