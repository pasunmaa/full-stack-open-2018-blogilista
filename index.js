const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const middleware = require('./utils/middleware')
const blogsRouter = require('./controllers/blogs')
const mongoose = require('mongoose')

const app = express()
app.use(cors())
app.use(bodyParser.json())
app.use(middleware.logger(':method :url :respdata :status :res[content-length] - :response-time ms'))
app.use(express.static('build'))

// const mongoUrl = 'mongodb://<dbuser>:<dbpassword>@ds143971.mlab.com:43971/blogilista'
// Luetaan dbuser ja dbpassword ympäristömuuttujista, joita ei tallenneta Githubiin
// console.log('DB CREDENTIALS: ',process.env.DbUserPuhLuet+':'+process.env.DbPasswordPuhLuet)
let mongoUrl = 'mongodb://' +
    process.env.DbUserPuhLuet + ':' +
    process.env.DbPasswordPuhLuet

if (process.env.NODE_ENV === 'production') {
  console.log('PRODUCTION DB')
  mongoUrl += '@ds143971.mlab.com:43971/blogilista_prod'
}
else {
  console.log('DEVELOPMENT DB')
  mongoUrl += '@ds143971.mlab.com:43971/blogilista'
}

//console.log('mongoUrl = ', mongoUrl)
mongoose.connect(mongoUrl, { useNewUrlParser: true })

app.use('/api/blogs', blogsRouter)

app.use(middleware.error)

const PORT = process.env.PORT || 3003
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})