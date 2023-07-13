import { Server } from 'socket.io'
import roomManager from './RoomManager'
import { generateRoomId, getRoomId, getUserId } from '../util/room'

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
        const roomId = roomManager.joinRoom(payload.roomId, {
          id: getUserId(socket.rooms),
          name: payload.member.name,
          isManager: payload.member.isManager,
        })
        if (!roomId) {
          console.log('invalid room id')
          return
        }
        console.log('join room :', payload.roomId)
        const socketRoomId = generateRoomId(payload.roomId.toString())
        socket.join(socketRoomId)
        this.emitEvent({
          roomId: socketRoomId,
          type: S2CEventType.CHATTING_UPDATED,
          payload: {
            type: 'SYS',
            text: `${payload.member.name} has joined.`,
          },
        })
        const room = roomManager.getRoom(roomId)
        if (!room) return
        this.emitEvent({
          roomId: socketRoomId,
          type: S2CEventType.MEMBER_UPDATED,
          payload: {
            memberList: room.getMemberList(),
          },
        })
      })
      socket.on('CHAT', (payload: ChatPayload) => {
        const id = getRoomId(socket.rooms)
        console.log(id)
        if (!id) return
        this.emitEvent({
          roomId: id,
          type: S2CEventType.CHATTING_UPDATED,
          payload: {
            type: 'USR',
            member: payload.member,
            text: payload.text,
          },
        })
        // if the word is current answer,
        // and game status will be updated.
        const room = roomManager.getRoom(id)
        if (!room) return
        const check = room.checkIsAnswer(payload.text)
        if (check) {
          room.stepToWordPhase()
        }
      })
      socket.on('DRAW', () => {
        //
      })
      socket.on('KICK', () => {
        //
      })
      socket.on('SELECT_WORD', (payload: SelectWordPayload) => {
        const id = getRoomId(socket.rooms)
        const room = roomManager.getRoom(id)
        if (!room) return
        room.stepToDrawPhase(payload.word)
      })
      socket.on('UPDATE_SETTING', (payload: UpdateSettingPayload) => {
        //
        const id = getRoomId(socket.rooms)
        const room = roomManager.getRoom(id)
        if (!room) return
        room.setConfig(payload.config)
        this.emitEvent({
          roomId: id,
          type: S2CEventType.SETTING_UPDATED,
          payload: { config: payload.config },
        })
      })
      socket.on('START', (payload: StartPayload) => {
        // TODO: check is valid user
        console.log('start')
        const id = getRoomId(socket.rooms)
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
