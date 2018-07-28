const supertest = require('supertest')
const { app, server } = require('../index')
const User = require('../models/user')
const api = supertest(app)
const { usersInDb } = require('./test_helper')

const testUsernames = []

describe('user tests', async () => {
  beforeEach(async () => {
    //await User.remove({})
    /* const user = new User({ username: 'root', password: 'sekret', adult: true })
    await user.save() */
  })

  test('Creation of an user fails with proper statuscode and message if username is already taken', async () => {
    //const usersBeforeOperation = await usersInDb()

    const ExistingUser = new User({ username: 'existinguser', password: 'salainen', adult: true })
    await ExistingUser.save()
    testUsernames[0] = ExistingUser.username

    const newUser = {
      username: 'existinguser',
      name: 'Existing User',
      password: 'salainen',
      adult: false
    }
    //testUsernames[0] = newUser.username

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body).toEqual({ error: 'username must be unique' })

    //const usersAfterOperation = await usersInDb()
    //expect(usersAfterOperation.length).toBe(usersBeforeOperation.length)
  })

  test('Creating a user without setting adult, set adult to true', async () => {
    const newUser = {
      username: 'anothertestuser',
      name: 'Another Testuser',
      password: 'salainen'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(result.body.adult).toBe(true)
    testUsernames[1] = newUser.username
  })

  test('Creating a user fails with 401 invalid password, if password is shorter than 3 chars', async () => {
    const newUser = {
      username: 'shortpassword',
      name: 'Short Password',
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

  test('User creation succeeds with a fresh username', async () => {
    //const usersBeforeOperation = await usersInDb()
    const newUser = {
      username: 'freshusertest' + Math.random()*10000,
      name: 'Petri Asunmaa',
      password: 'salainen',
      adult: true
    }
    testUsernames[2] = newUser.username

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const usersAfterOperation = await usersInDb()
    //expect(usersAfterOperation.length).toBe(usersBeforeOperation.length+1)
    const usernames = usersAfterOperation.map(u => u.username)
    //console.log(usersAfterOperation, usernames)
    expect(usernames).toContain(newUser.username)
  })
})

afterAll(async () => {
  // remove all test users used in this module test
  //console.log(testUsernames)
  await User.remove({ username: testUsernames })
  await server.close(true)
  //console.log('server closed in users.test.js')
})