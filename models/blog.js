const mongoose = require('mongoose')

const BlogSchema = mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
})

BlogSchema.statics.format = function (blogentry) {
  return {
    id: blogentry._id,
    title: blogentry.title,
    author: blogentry.author,
    url: blogentry.url,
    likes: blogentry.likes,
    user: blogentry.user
  }
}

const Blog = mongoose.model('Blog', BlogSchema)

module.exports = Blog

