const dummy = (blogs) => {
  //console.log(blogs.length)
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((total, item) => total + item.likes, 0)
  /* const totalLikesCount = blogs.reduce((total, item) => {return(total + item.likes)}, 0)
  console.log('total = ', totalLikesCount)
  return totalLikesCount */
}

const favoriteBlog = (blogs) => {
  const iMax = blogs.reduce((maxIndex, blog, index, array) =>
    maxIndex = blog.likes > array[maxIndex].likes ? index : maxIndex
    /* const iMax = blogs.reduce((maxIndex, blog, index, array) => {
    console.log(blog.likes, array[maxIndex].likes, index, maxIndex, array[index].title)
    maxIndex = blog.likes > array[maxIndex].likes ? index : maxIndex
    return maxIndex
  }*/,
  0)
  return {
    title: blogs[iMax].title,
    author: blogs[iMax].author,
    likes: blogs[iMax].likes
  }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog
}