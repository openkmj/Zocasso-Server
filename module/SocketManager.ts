import { Server } from 'socket.io'

// method (client -> server)
// join
// leave
// chat(submit)
// draw
// select word
// update setting
// start
// kick

// event (server -> client)
// setting updated
// status updated(stage, drawer, ...)
// member update
// chat update
// draw

// join
// member update
// kick

class SocketManagerClass {
  io: Server | null
  constructor() {
    this.io = null
  }
  init(server: any) {
    this.io = new Server(server, { cors: { origin: '*' } })
    this.io.on('connection', (socket) => {
      socket.on('JOIN_ROOM', (id) => {
        console.log('join room :', id)
        socket.join(id.toString())
        this.emitEvent(id, 'CHAT', {
          type: 'sys',
          text: '000 has joined.',
        })
      })
      socket.on('disconnect', (id) => {
        //
      })
      socket.on('CHAT', ({}) => {
        //
      })
    })
  }
  emitEvent(roomId: string, type: 'CHAT' | 'MEMBER_UPDATE', params: any) {
    if (!this.io) return
    console.log(`emit ${type} event to ${roomId}`)
    console.log(params)
    this.io.in(roomId.toString()).emit(type, params)
  }
}

const SocketManager = new SocketManagerClass()

export default SocketManager
