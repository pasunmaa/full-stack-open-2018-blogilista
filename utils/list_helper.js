const dummy = (blogs) => {
  console.log(blogs.length)
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((total, item) => total + item.likes, 0)
  /* const totalLikesCount = blogs.reduce((total, item) => {return(total + item.likes)}, 0)
  console.log('total = ', totalLikesCount)
  return totalLikesCount */
}

module.exports = {
  dummy,
  totalLikes
}