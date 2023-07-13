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
  setConfig(config: RoomConfig) {
    if (config.language) this.config.language = config.language
    if (config.isPrivate !== undefined) this.config.isPrivate = config.isPrivate
    if (config.drawTime) this.config.drawTime = config.drawTime
    if (config.round) this.config.round = config.round
  }
  start() {
    if (this.game) return null
    this.game = new Game(this.id, this.memberList, this.config.language)
    this.game.startWordPhase()
  }
  stepToWordPhase() {
    if (!this.game) return null
    this.game.startWordPhase()
  }
  stepToDrawPhase(word: string) {
    if (!this.game) return null
    this.game.startDrawPhase(word)
  }
  checkIsAnswer(word: string) {
    if (!this.game) return false
    return this.game.validateWord(word)
  }
}

class RoomManager {
  private roomTable: RoomTable
  constructor() {
    this.roomTable = {}
  }
  getRoom(id: string) {
    if (!this.roomTable[id.replace('ROOMS-', '')]) return null
    return this.roomTable[id.replace('ROOMS-', '')]
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
  getAvailableRoom(lang: AvailableLangugae) {
    // TODO: return available public room or create new public room
    return this.createRoom({
      isPrivate: false,
      language: lang,
    })
  }
}

const roomManager = new RoomManager()

export default roomManager
