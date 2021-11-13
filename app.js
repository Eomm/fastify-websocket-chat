'use strict'

const fs = require('fs/promises')
const path = require('path')

module.exports = function plugin (instance, opts, next) {
  instance.register(require('fastify-websocket'))

  instance.get('/', async (request, reply) => {
    reply.type('text/html')
    return fs.readFile(path.join(__dirname, 'pages/chat.html'))
  })

  instance.get('/chat',
    { websocket: true },
    (connection) => {
      const { socket } = connection

      //   fastify.server.close = function (cb) {
      // const server = fastify.websocketServer
      // for (const client of server.clients) {
      //   client.close()
      // }
      // oldClose.call(this, cb)

      // if (history.length > 0) {
      // }

      socket.on('message', function (message) {
        try {
          const json = JSON.parse(message.toString())
          switch (json.type) {
            case 'message':
              sendMessage({
                type: 'accepted',
                data: `${new Date().toISOString()}: ${json.data}`
              })
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
