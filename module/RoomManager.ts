import { Member } from '../util/const'
import { getRandomString } from '../util/random'

const CONNECTION_TIMEOUT = 3 * 1000

interface RoomTable {
  [key: string]: Room
}
interface RoomConfig {
  isPrivate: boolean
}

const ROOM_STATUS = {
  PENDING: 0, // 로비 대기
  SELECTING_WORD: 1, // 단어 선택 중
  DRAWING: 2, // 그림 그리는 중
}
type ROOM_STATUS_TYPE = (typeof ROOM_STATUS)[keyof typeof ROOM_STATUS]

class Room {
  private id: string
  private memberList: Member[]
  private config: RoomConfig
  private status: ROOM_STATUS_TYPE
  private word: string
  private activeUser: Member
  constructor(id: string, config: RoomConfig) {
    this.id = id
    this.memberList = []
    this.config = config
    this.status = ROOM_STATUS.PENDING
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
    if (this.status !== ROOM_STATUS.PENDING) return
    this.status = ROOM_STATUS.SELECTING_WORD
    this.activeUser = this.memberList[0]
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
    return this.roomTable[id]
  }
  getRoomInfo(id: string) {
    if (!this.roomTable[id]) return null
    return this.roomTable[id].getMemberList()
  }
}

const roomManager = new RoomManager()

export default roomManager
