// const mongoUrl = 'mongodb://<dbuser>:<dbpassword>@ds143971.mlab.com:43971/blogilista'
// Luetaan dbuser ja dbpassword ympäristömuuttujista, joita ei tallenneta Githubiin eikä .env-tiedostoon
require('dotenv').config()
let mongoUrl = 'mongodb://' +
    process.env.DbUserPuhLuet + ':' +
    process.env.DbPasswordPuhLuet + '@'

if (process.env.NODE_ENV === 'production') {
  console.log('PRODUCTION DB')
  mongoUrl += process.env.PRODUCTION_DB
}
else {
  console.log('DEVELOPMENT DB')
  mongoUrl += process.env.DEVELOPMENT_DB
}

//console.log(mongoUrl)
//console.log('ENVIRONMENT: ', process.env.SECRET)
//console.log('DB CREDENTIALS: ',process.env.DbUserPuhLuet+':'+process.env.DbPasswordPuhLuet)

let port = 3001 // default port number
if (process.env.NODE_ENV === 'test')
  port = process.env.TEST_PORT
else if (process.env.PORT)
  port = process.env.PORT

module.exports = {
  mongoUrl,
  port
}