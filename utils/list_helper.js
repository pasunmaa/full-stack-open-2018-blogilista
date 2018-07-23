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
    blog.likes > array[maxIndex].likes ? index : maxIndex
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

const mostBlogs = (blogs) => {
  // 1. Create authors array from blogs array
  const allAuthors = blogs.reduce((authors, blog) => {
    let authorIndex = authors.findIndex(author => author.author === blog.author)
    if (authorIndex + 1)
      authors[authorIndex].blogs++
    else {
      authors.push({
        author: blog.author,
        blogs: 1 })
    }
    //console.log(authors)
    return authors
  }, [])
  // 2. Find the the author with most blogs from authors array
  const iMostBlogs = allAuthors.reduce((maxIndex, author, index, array) =>
    maxIndex = author.blogs > array[maxIndex].blogs ? index : maxIndex, 0)

  return (allAuthors[iMostBlogs])
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs
}