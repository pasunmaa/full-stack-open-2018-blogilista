const listHelper = require('../utils/list_helper')
const testHelper = require('../tests/test_helper')

describe/* .skip */('list helpers', () => {

  describe('dummy tests', () => {
    test('dummy is called', () => {
      const blogs = []

      const result = listHelper.dummy(blogs)
      expect(result).toBe(1)
    })
  })

  describe('total likes', () => {
    const listWithOneBlog = [
      {
        _id: '5a422aa71b54a676234d17f8',
        title: 'Go To Statement Considered Harmful',
        author: 'Edsger W. Dijkstra',
        url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
        likes: 5,
        __v: 0
      }
    ]

    test('when list has only one blog equals the likes of that', () => {
      const result = listHelper.totalLikes(listWithOneBlog)
      expect(result).toBe(5)
    })

    test('when list has several blogs equals the likes of that', () => {
      const result = listHelper.totalLikes(testHelper.initialBlogs)
      expect(result).toBe(36)
    })
  })

  describe('favorite blog', () => {
    test('the most liked blog', () => {
      const result = listHelper.favoriteBlog(testHelper.initialBlogs)
      expect(result).toEqual(
        {
          title: 'Canonical string reduction',
          author: 'Edsger W. Dijkstra',
          likes: 12
        }
      )
    })
  })

  describe('most blogs', () => {
    test('the author with most blogs', () => {
      const result = listHelper.mostBlogs(testHelper.initialBlogs)
      expect(result).toEqual(
        {
          author: 'Robert C. Martin',
          blogs: 3
        }
      )
    })
  })

  describe('most likes', () => {
    test('the author with most likes', () => {
      const result = listHelper.mostLikes(testHelper.initialBlogs)
      expect(result).toEqual(
        {
          author: 'Edsger W. Dijkstra',
          likes: 17
        }
      )
    })
  })

})