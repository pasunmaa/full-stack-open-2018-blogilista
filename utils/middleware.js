const logger = require('morgan')

logger.token('respdata', (req) => {
  //console.log(req.body)
  return JSON.stringify(req.body)
})

//console.log(typeof logger)

const error = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

module.exports = { logger, error }