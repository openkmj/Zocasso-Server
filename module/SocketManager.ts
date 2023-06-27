import { Server } from 'socket.io'
import roomManager from './RoomManager'

const generateRoomId = (id: string) => {
  return `ROOMS-${id}`
}

const getRoomId = (rooms: Set<string>) => {
  let room = ''
  for (let i of rooms) {
    if (i.includes('ROOMS-')) {
      room = i
    }
  }
  return room
}
const getUserId = (rooms: any) => {
  let room = ''
  for (let i in rooms) {
    if (!i.includes('ROOMS-')) {
      room = i
    }
  }
  return room
}

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
      socket.on(C2SEventType.JOIN, (payload: JoinPayload) => {
        if (!payload.roomId || !payload?.member?.name) {
          console.error('invalid input')
          return
        }
        console.log('join room :', payload.roomId)
        const r = generateRoomId(payload.roomId.toString())
        socket.join(r)
        roomManager.createRoom({
          isPrivate: true,
          language: 'ko',
        })
        roomManager.joinRoom(payload.roomId, payload.member)
        this.emitEvent({
          roomId: r,
          type: S2CEventType.CHATTING_UPDATED,
          payload: {
            type: 'SYS',
            text: `${payload.member.name} has joined.`,
          },
        })
      })
      socket.on('CHAT', (payload: ChatPayload) => {
        let room = getRoomId(socket.rooms)
        console.log(room)
        if (!room) return
        this.emitEvent({
          roomId: room,
          type: S2CEventType.CHATTING_UPDATED,
          payload: {
            type: 'USR',
            member: payload.member,
            text: payload.text,
          },
        })
        // if the word is current answer,
        // and game status will be updated.
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
        const id = ''
        const room = roomManager.getRoom(id)
        if (!room) return
        room.start()
      })
    })
  }
  emitEvent(event: S2CEvent) {
    if (!this.io) return
    console.log(`emit ${event.type} event to ${event.roomId}`)
    console.log(event.payload)
    this.io.in(event.roomId).emit(event.type, event.payload)
  }
}

const SocketManager = new SocketManagerClass()

export default SocketManager
