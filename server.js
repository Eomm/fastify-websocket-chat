'use strict'

const fastify = require('fastify')({ logger: true })
fastify.register(require('./app'))
fastify.listen(8080)
