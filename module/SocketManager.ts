import { Server } from 'socket.io'
import {
  getChatHandler,
  getDisconnectHandler,
  getDrawHandler,
  getJoinHandler,
  getKickHandler,
  getSelectWordHandler,
  getSkipHandler,
  getStartHandler,
  getUpdateSettingHandler,
} from '../handler'
import logger from '../util/logger'

class SocketManager {
  io: Server | null
  constructor() {
    this.io = null
  }
  init(server: any) {
    this.io = new Server(server, { cors: { origin: '*' } })
    this.io.on('connection', (socket) => {
      socket.on(C2SEventType.JOIN, getJoinHandler(socket))
      socket.on(C2SEventType.CHAT, getChatHandler(socket))
      socket.on(C2SEventType.DRAW, getDrawHandler(socket))
      socket.on(C2SEventType.KICK, getKickHandler(socket))
      socket.on(C2SEventType.SKIP, getSkipHandler(socket))
      socket.on(C2SEventType.SELECT_WORD, getSelectWordHandler(socket))
      socket.on(C2SEventType.START, getStartHandler(socket))
      socket.on(C2SEventType.UPDATE_SETTING, getUpdateSettingHandler(socket))
      socket.on('disconnect', getDisconnectHandler(socket))
    })
  }
  emitEvent(event: S2CEvent, except?: string) {
    if (!this.io) return
    if (except) {
      logger.log(`emit ${event.type} event to ${event.roomId} except ${except}`)
      logger.log(event.payload)
      this.io.in(event.roomId).except(except).emit(event.type, event.payload)
    } else {
      logger.log(`emit ${event.type} event to ${event.roomId}`)
      logger.log(event.payload)
      this.io.in(event.roomId).emit(event.type, event.payload)
    }
  }
}

const socketManager = new SocketManager()

export default socketManager
