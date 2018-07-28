const logger = require('morgan')

logger.token('respdata', (req) => {
  //console.log(req.body)
  return JSON.stringify(req.body)
})

const error = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const tokenExtractor = (request, response, next) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    request.token = authorization.substring(7)
  }
  next()
}

module.exports = { logger, error, tokenExtractor }