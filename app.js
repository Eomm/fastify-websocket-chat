'use strict'

const fs = require('fs/promises')
const path = require('path')

module.exports = function plugin (app, opts, next) {
  app.register(require('fastify-websocket'), {
    clientTracking: true
  })

  const history = []

  app.get('/', async (request, reply) => {
    reply.type('text/html')
    return fs.readFile(path.join(__dirname, 'pages/chat.html'))
  })

  app.get('/chat',
    { websocket: true },
    (connection) => {
      const { socket } = connection

      history.map(msg => socket.send(msg))

      socket.on('message', function (message) {
        try {
          const json = JSON.parse(message.toString())
          switch (json.type) {
            case 'message':
              {
                const messageEvent = JSON.stringify({
                  type: 'accepted',
                  data: `${new Date().toISOString()}: ${json.data}`
                })

                const server = app.websocketServer
                // broadcast to all clients
                app.log.info('broadcasting to all clients', server.clients.size)
                for (const client of server.clients) {
                  client.send(messageEvent)
                }

                history.push(messageEvent)
              }
              break

            default:
              sendMessage({ type: 'reject', data: 'wrong type' })
              break
          }
        } catch (error) {
          sendMessage({ type: 'error', data: error.message })
        }
      })

      function sendMessage (message) {
        socket.send(JSON.stringify(message))
      }
    })
  next()
}
