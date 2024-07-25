import { Socket } from 'socket.io'
import roomManager from '../module/RoomManager'
import socketManager from '../module/SocketManager'
import { generateRoomId, getRoomId, getUserId } from '../util/room'
import logger from '../util/logger'

const getJoinHandler = (socket: Socket) => (payload: JoinPayload) => {
  if (!payload.roomId || !payload?.member?.name) {
    logger.error('invalid input')
    return
  }
  const uid = getUserId(socket.rooms)
  if (!uid) return

  const roomId = roomManager.joinRoom(payload.roomId, {
    id: uid,
    name: payload.member.name,
    character: payload.member.character,
    isManager: payload.member.isManager,
  })
  if (!roomId) {
    logger.error('invalid room id', payload.roomId)
    return
  }
  logger.log('join room :', roomId)
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

const getDrawHandler = (socket: Socket) => (payload: DrawPayload) => {
  const id = getRoomId(socket.rooms)
  if (!id) return
  // update canvas frame
  socketManager.emitEvent({
    roomId: id,
    type: S2CEventType.CANVAS_UPDATED,
    payload: {
      data: payload.data,
    },
  })
}

const getKickHandler = (socket: Socket) => (payload: KickPayload) => {
  // TODO: check is valid user (only room manager)
  const id = getRoomId(socket.rooms)
  if (!id) return
  const room = roomManager.getRoom(id)
  if (!room) return
  room.leave(payload.member.id)
}

const getSkipHandler = (socket: Socket) => (payload: SkipPayload) => {
  const id = getRoomId(socket.rooms)
  if (!id) return
  // if the word is current answer,
  // and game status will be updated.
  const room = roomManager.getRoom(id)
  if (!room) return
  const uid = getUserId(socket.rooms)
  if (!uid) return
  const m = room.getMemberById(uid)
  if (!m) return
  room.skip(m)
}

const getSelectWordHandler =
  (socket: Socket) => (payload: SelectWordPayload) => {
    // TODO: check is valid user (only drawer of this turn)
    const id = getRoomId(socket.rooms)
    if (!id) return
    const room = roomManager.getRoom(id)
    if (!room) return
    room.selectWord(payload.word)
  }

const getStartHandler = (socket: Socket) => (payload: StartPayload) => {
  // TODO: check is valid user (only room manager)
  const id = getRoomId(socket.rooms)
  if (!id) return
  const room = roomManager.getRoom(id)
  if (!room) return
  room.start()
}

const getUpdateSettingHandler =
  (socket: Socket) => (payload: UpdateSettingPayload) => {
    // TODO: check is valid user (only room manager)
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

const getDisconnectHandler = (socket: Socket) => () => {
  const id = getRoomId(socket.rooms)
  if (!id) return
  const room = roomManager.getRoom(id)
  if (!room) return
  const uid = getUserId(socket.rooms)
  if (!uid) return

  logger.log('leave room :', uid, id)
  room.leave(uid)

  socketManager.emitEvent({
    roomId: id,
    type: S2CEventType.MEMBER_UPDATED,
    payload: {
      memberList: room.getMemberList(),
    },
  })
  if (room.isEmpty()) {
    roomManager.deleteRoom(id)
  }
}

export {
  getChatHandler,
  getDisconnectHandler,
  getDrawHandler,
  getJoinHandler,
  getKickHandler,
  getSelectWordHandler,
  getSkipHandler,
  getStartHandler,
  getUpdateSettingHandler,
}
