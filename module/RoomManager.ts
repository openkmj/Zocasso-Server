import { getRandomString } from '../util/random'

const CONNECTION_TIMEOUT = 3 * 1000

interface Member {
  id: string
  name: string
}
interface RoomTable {
  [key: string]: Room
}
interface RoomConfig {
  isPrivate: boolean
}

class Room {
  private id: string
  private memberList: Member[]
  private config: RoomConfig
  constructor(id: string, config: RoomConfig) {
    this.id = id
    this.memberList = []
    this.config = config
  }
  join(member: Member) {
    this.memberList.push(member)
  }
  leave(member: Member) {
    // this.memberList.splice()
  }
  getMemberList() {
    return this.memberList
  }
}

class RoomManager {
  private roomTable: RoomTable
  constructor() {
    this.roomTable = {}
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
    return this.roomTable[id]
  }
  getRoomInfo(id: string) {
    if (!this.roomTable[id]) return null
    return this.roomTable[id].getMemberList()
  }
}

const roomManager = new RoomManager()

export default roomManager
