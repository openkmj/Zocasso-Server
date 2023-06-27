import { getRandomString } from '../util/random'
import Game from './Game'

const CONNECTION_TIMEOUT = 3 * 1000

interface RoomTable {
  [key: string]: Room
}

class Room {
  id: string
  private memberList: Member[]
  private config: RoomConfig
  private game: Game | null
  constructor(id: string, config: RoomConfig) {
    this.id = id
    this.memberList = []
    this.config = config
    this.game = null
  }
  join(member: Member) {
    this.memberList.push(member)
  }
  leave(member: Member) {
    this.memberList = this.memberList.filter((m) => m.id !== member.id)
  }
  getMemberList() {
    return this.memberList
  }
  getConfig() {
    return this.config
  }
  start() {
    if (this.game) return null
    this.game = new Game(this.memberList, this.config.language)
    const m = this.game.getNextDrawer()
  }
  gotoSelectingWord() {
    // select user
  }
  gotoDrawing() {
    // ...
  }
}

class RoomManager {
  private roomTable: RoomTable
  constructor() {
    this.roomTable = {}
  }
  getRoom(id: string) {
    if (!this.roomTable[id]) return null
    return this.roomTable[id]
  }
  hasRoom(id: string) {
    if (this.roomTable[id]) return true
    return false
  }
  createRoom(config: RoomConfig) {
    const id = getRandomString()
    this.roomTable[id] = new Room(id, config)
    return id
  }
  joinRoom(id: string, member: Member) {
    if (!this.roomTable[id]) return null
    this.roomTable[id].join(member)
    return this.roomTable[id].id
  }
  getRoomInfo(id: string) {
    if (!this.roomTable[id]) return null
    return this.roomTable[id].getMemberList()
  }
}

const roomManager = new RoomManager()

export default roomManager
