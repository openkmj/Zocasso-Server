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
      socket.on('JOIN', (id) => {
        console.log('join room :', id)
        socket.join(id.toString())
        this.emitEvent(id, 'CHAT', {
          type: 'sys',
          text: '000 has joined.',
        })
      })
      socket.on('LEAVE', () => {
        //
      })
      socket.on('CHAT', () => {
        // 1. broadcast chat to other clients
        // 2. if the word is current answer,
        // game status updated.
        //
      })
      socket.on('DRAW', () => {
        //
      })
      socket.on('KICK', () => {
        //
      })
      socket.on('SELECT_WORD', () => {
        //
      })
      socket.on('UPDATE_SETTING', () => {
        //
      })
      socket.on('START', () => {
        //
      })
    })
  }
  emitEvent(
    roomId: string,
    type:
      | 'CHAT'
      | 'MEMBER_UPDATE'
      | 'STAGE_UPDATED'
      | 'CANVAS_UPDATED'
      | 'SETTING_UPDATED',
    params: any
  ) {
    if (!this.io) return
    console.log(`emit ${type} event to ${roomId}`)
    console.log(params)
    this.io.in(roomId.toString()).emit(type, params)
  }
}

const SocketManager = new SocketManagerClass()

export default SocketManager
