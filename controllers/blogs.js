const blogsRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const Blog = require('../models/blog')
const User = require('../models/user')

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
    const decodedToken = jwt.verify(request.token, process.env.SECRET)

    if (!decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }

    const newBlog = {
      title: request.body.title,
      author: request.body.author,
      url: request.body.url,
      likes: request.body.likes || 0,
      user: decodedToken.id
    }

    if (request.body.title === undefined || request.body.url === undefined)
      return response.status(400).json({ error: 'title or body missing' })

    const blog = new Blog(newBlog)

    const savedEntry = await blog.save()

    // Save a new blog to the user's blogs entry in database
    const aUser = await User.find({ _id: decodedToken.id })
    aUser[0].blogs = aUser[0].blogs.concat(savedEntry._id)
    await aUser[0].save()
    const user = { _id: aUser[0]._id, name: aUser[0].name, username: aUser[0].username }
    const returnBlog = {
      ...Blog.format(savedEntry),
    }
    returnBlog.user = user
    //console.log(returnBlog)

    return response.json(returnBlog)
  }
  catch (exception) {
    if (exception.name === 'JsonWebTokenError' ) {
      response.status(401).json({ error: exception.message })
    }
    else {
      console.log('blogentry creation failed', exception)
      response.status(500).json({ error: 'blogentry creation failed' })
    }
  }
})

blogsRouter.delete('/:id', async (request, response) => {
  try {
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    if (!decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }

    const blog = await Blog.findById(request.params.id)
    //console.log('delete blog OWNED BY ', blog.user)
    if (!blog)
      response.status(404).json({ error: 'failed to delete non-existing blog' })
    else if ( blog.user && (blog.user.toString() !== decodedToken.id.toString()) )
      // if blog.user is undefined anybody can delete it
      return response.status(401).json({ error: 'only its creator can delete a blog' })
    else {
      await Blog.findByIdAndRemove(request.params.id)
      // remove blog also from the user who has created a blog-entry, if user exists
      if (blog.user) {
        const aUser = await User.find({ _id: blog.user })
        //console.log(request.params.id, aUser[0].blogs)
        aUser[0].blogs = aUser[0].blogs.filter(blog => blog.toString() !== request.params.id)
        await aUser[0].save()
      }
      response.status(204).end()
    }
  }
  catch (exception) {
    console.log('blogentry delete failed', exception)
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