const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', (request, response) => {
  Blog
    .find({})
    .then(blogs => {
      response.json(blogs.map(Blog.format))
    })
    .catch(error => console.log('bloglist find failed', error))
})

blogsRouter.post('/', (request, response) => {
  const blog = new Blog(request.body)

  blog
    .save()
    .then(savedEntry => {
      return response.json(Blog.format(savedEntry))
    })
    .catch(error => console.log('blogentry.save failed', error))
})

module.exports = blogsRouter