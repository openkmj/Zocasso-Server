import { Socket } from 'socket.io'
import { generateRoomId, getRoomId, getUserId } from '../util/room'
import socketManager from '../module/SocketManager'
import roomManager from '../module/RoomManager'

const getJoinHandler = (socket: Socket) => (payload: JoinPayload) => {
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
    console.error('invalid room id')
    return
  }
  console.log('join room :', payload.roomId)
  const socketRoomId = generateRoomId(payload.roomId.toString())
  socket.join(socketRoomId)
  socketManager.emitEvent({
    roomId: socketRoomId,
    type: S2CEventType.CHATTING_UPDATED,
    payload: {
      type: 'SYS',
      text: `${payload.member.name} has joined.`,
    },
  })
  const room = roomManager.getRoom(roomId)
  if (!room) return
  socketManager.emitEvent({
    roomId: socketRoomId,
    type: S2CEventType.MEMBER_UPDATED,
    payload: {
      memberList: room.getMemberList(),
    },
  })
}

const getChatHandler = (socket: Socket) => (payload: ChatPayload) => {
  const id = getRoomId(socket.rooms)
  if (!id) return
  socketManager.emitEvent({
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
  room.guess(payload.member, payload.text)
}

const getDrawHandler = (socket: Socket) => () => {}

const getKickHandler = (socket: Socket) => () => {}

const getSkipHandler = (socket: Socket) => (payload: SkipPayload) => {
  const id = getRoomId(socket.rooms)
  if (!id) return
  // if the word is current answer,
  // and game status will be updated.
  const room = roomManager.getRoom(id)
  if (!room) return
  const uid = getUserId(socket.rooms)
  const m = room.getMemberById(uid)
  if (!m) return
  room.skip(m)
}

const getSelectWordHandler =
  (socket: Socket) => (payload: SelectWordPayload) => {
    const id = getRoomId(socket.rooms)
    if (!id) return
    const room = roomManager.getRoom(id)
    if (!room) return
    room.selectWord(payload.word)
  }

const getStartHandler = (socket: Socket) => (payload: StartPayload) => {
  // TODO: check is valid user
  const id = getRoomId(socket.rooms)
  if (!id) return
  const room = roomManager.getRoom(id)
  if (!room) return
  room.start()
}

const getUpdateSettingHandler =
  (socket: Socket) => (payload: UpdateSettingPayload) => {
    // TODO: check is valid user
    const id = getRoomId(socket.rooms)
    if (!id) return
    const room = roomManager.getRoom(id)
    if (!room) return
    room.setConfig(payload.config)
    socketManager.emitEvent({
      roomId: id,
      type: S2CEventType.SETTING_UPDATED,
      payload: { config: payload.config },
    })
  }

export {
  getJoinHandler,
  getChatHandler,
  getDrawHandler,
  getKickHandler,
  getSkipHandler,
  getSelectWordHandler,
  getStartHandler,
  getUpdateSettingHandler,
}
