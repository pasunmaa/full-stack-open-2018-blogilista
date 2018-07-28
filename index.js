const http = require('http')
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const mongoose = require('mongoose')

const middleware = require('./utils/middleware')
const blogsRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/users')
const config = require('./utils/config')
const loginRouter = require('./controllers/login')

const app = express()
app.use(cors())
app.use(bodyParser.json())
app.use(express.static('build'))
if ( process.env.NODE_ENV !== 'test' )
  app.use(middleware.logger(':method :url :respdata :status :res[content-length] - :response-time ms'))
app.use(middleware.tokenExtractor)

mongoose
  .connect(config.mongoUrl, { useNewUrlParser: true })
  .then( () => {
    console.log('connected to database') //, config.mongoUrl)
  })
  .catch( err => {
    console.log(err)
  })

app.use('/api/blogs', blogsRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)

app.use(middleware.error)

const server = http.createServer(app)

server.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`)
})

server.on('close', () => {
  mongoose.connection.close()
})

module.exports = {
  app, server
}