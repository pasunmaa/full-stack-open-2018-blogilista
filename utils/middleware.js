const logger = require('morgan')

logger.token('respdata', (req) => {
  //console.log(req.body)
  return JSON.stringify(req.body)
})

//console.log(typeof logger)

module.exports = { logger }