const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/',async (request, response) => {
  try {
    const blogs = await Blog.find({})
    response.json(blogs.map(Blog.format))
  }
  catch (error) {
    console.log('bloglist find failed', error)
  }
})

blogsRouter.post('/', async (request, response) => {
  try {
    const newBlog = {
      title: request.body.title,
      author: request.body.author,
      url: request.body.url,
      likes: request.body.likes || 0
    }

    if (request.body.title === undefined || request.body.url === undefined)
      return response.status(400).send({ error: 'title or body missing' })

    const blog = new Blog(newBlog)
    //console.log(blog)

    const savedEntry = await blog.save()
    return response.json(Blog.format(savedEntry))
  }
  catch (error) {
    console.log('blogentry.save failed', error)
  }
})

module.exports = blogsRouter