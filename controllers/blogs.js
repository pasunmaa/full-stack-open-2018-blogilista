const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/',async (request, response) => {
  try {
    const blogs = await Blog.find({})
    response.json(blogs.map(Blog.format))
  }
  catch (error) {
    error => console.log('bloglist find failed', error)
  }
})

blogsRouter.post('/', async (request, response) => {
  const blog = new Blog(request.body)
  try {
    const savedEntry = await blog.save()
    return response.json(Blog.format(savedEntry))
  }
  catch (error) {
    error => console.log('blogentry.save failed', error)
  }
})

module.exports = blogsRouter