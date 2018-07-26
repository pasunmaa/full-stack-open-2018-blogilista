const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/',async (request, response) => {
  try {
    const blogs = await Blog
      .find({})
      .populate('user', { _id: 1, username: 1, name: 1 })
    response.json(blogs.map(Blog.format))
  }
  catch (error) {
    console.log('bloglist find failed', error)
  }
})

blogsRouter.post('/', async (request, response) => {
  try {
    const User = require('../models/user')
    const users = await User.find({})
    //console.log(users)
    const firstuserid = users[0].id
    const newBlog = {
      title: request.body.title,
      author: request.body.author,
      url: request.body.url,
      likes: request.body.likes || 0,
      user: firstuserid //await User.find({})[0]
    }

    if (request.body.title === undefined || request.body.url === undefined)
      return response.status(400).json({ error: 'title or body missing' })

    const blog = new Blog(newBlog)
    //console.log(blog)

    const savedEntry = await blog.save()

    users[0].blogs = users[0].blogs.concat(savedEntry._id)
    await users[0].save()

    return response.json(Blog.format(savedEntry))
  }
  catch (error) {
    console.log('blogentry save failed', error)
  }
})

blogsRouter.delete('/:id', async (request, response) => {
  let query = {}
  try {
    query = await Blog.findByIdAndRemove(request.params.id)
    if (query === null)
      response.status(404).json({ error: 'failed to delete non-existing blog' })
    else
      response.status(204).end()
    //console.log(query)
  }
  catch (exception) {
    console.log('blogentry delete failed', exception)
    //console.log(query)
    response.status(400).json({ error: 'malformatted id' })
  }
})

blogsRouter.put('/:id', async (request, response) => {
  try {
    const blog = {
      title: request.body.title,
      author: request.body.author,
      url: request.body.url,
      likes: request.body.likes
    }

    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true } )
    if (updatedBlog === null)
      response.status(404).json({ error: 'failed to udpate non-existing blog' })
    else
      response.json(Blog.format(updatedBlog))
  }
  catch (exception) {
    console.log('blogentry udpate failed', exception)
    response.status(400).json({ error: 'malformatted id' })
  }
})

module.exports = blogsRouter