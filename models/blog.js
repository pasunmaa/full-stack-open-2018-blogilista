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

module.exports = Blog

