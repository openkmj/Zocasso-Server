const { io } = require('socket.io-client')
const axios = require('axios').default

const BASE_URL = 'http://localhost:3005'

async function main() {
  console.log('create room')
  const { data } = await axios.post(`${BASE_URL}/room`)
  console.log(result.data.roomId)

  const socket = io(BASE_URL)

  socket.on('connect', () => {
    console.log('connected')
    socket.emit('JOIN', { roomId: data.roomId })
    setTimeout(() => {
      socket.emit('CHAT', {})
    }, 2000)
  })

  socket.connect()
}

main()
