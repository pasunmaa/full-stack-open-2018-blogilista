//const http = require('http')
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const mongoose = require('mongoose')

const BlogSchema = mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number
})

BlogSchema.statics.format = function (blogentry) {
  return {
    id: blogentry._id,
    title: blogentry.title,
    author: blogentry.author,
    url: blogentry.url,
    likes: blogentry.likes
  }
}

const Blog = mongoose.model('Blog', BlogSchema)
//module.exports = Blog

morgan.token('respdata', (req) => {
  //console.log(req.body)
  return JSON.stringify(req.body)
})

const app = express()
app.use(cors())
app.use(bodyParser.json())
app.use(morgan(':method :url :respdata :status :res[content-length] - :response-time ms'))
app.use(express.static('build'))

// const mongoUrl = 'mongodb://<dbuser>:<dbpassword>@ds143971.mlab.com:43971/blogilista'
// Luetaan dbuser ja dbpassword ympäristömuuttujista, joita ei tallenneta Githubiin
// console.log('DB CREDENTIALS: ',process.env.DbUserPuhLuet+':'+process.env.DbPasswordPuhLuet)
let mongoUrl = 'mongodb://' +
    process.env.DbUserPuhLuet + ':' +
    process.env.DbPasswordPuhLuet

if (process.env.NODE_ENV === 'production') {
  console.log('PRODUCTION DB')
  mongoUrl += '@ds143971.mlab.com:43971/blogilista_prod'
}
else {
  console.log('DEVELOPMENT DB')
  mongoUrl += '@ds143971.mlab.com:43971/blogilista'
}

//console.log('mongoUrl = ', mongoUrl)
mongoose.connect(mongoUrl, { useNewUrlParser: true })

app.get('/api/blogs', (request, response) => {
  Blog
    .find({})
    .then(blogs => {
      response.json(blogs.map(Blog.format))
    })
    .catch(error => console.log('bloglist find failed', error))
})

app.post('/api/blogs', (request, response) => {
  const blog = new Blog(request.body)

  blog
    .save()
    .then(savedEntry => {
      return response.json(Blog.format(savedEntry))
    })
    .catch(error => console.log('blogentry.save failed', error))
})

const PORT = 3003
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})