import { getRandomString } from '../util/random'
import Game from './Game'

const CONNECTION_TIMEOUT = 3 * 1000

interface RoomTable {
  [key: string]: Room
}

class Room {
  id: string
  private memberList: MemberInRoom[]
  private config: RoomConfig
  private game: Game | null
  constructor(id: string, config: RoomConfig) {
    this.id = id
    this.memberList = []
    this.config = config
    this.game = null
  }
  join(member: MemberInRoom) {
    this.memberList.push(member)
  }
  leave(id: string) {
    this.memberList = this.memberList.filter((m) => m.id !== id)
  }
  getMemberList() {
    return this.memberList
  }
  getMemberById(id: string) {
    return this.memberList.find((i) => i.id === id)
  }
  getConfig() {
    return this.config
  }
  setConfig(config: RoomConfig) {
    if (config.language) this.config.language = config.language
    if (config.isPrivate !== undefined) this.config.isPrivate = config.isPrivate
    if (config.maxPlayer) this.config.maxPlayer = config.maxPlayer
    if (config.drawTime) this.config.drawTime = config.drawTime
    if (config.round) this.config.round = config.round
    if (config.showWordLength !== undefined)
      this.config.showWordLength = config.showWordLength
    if (config.customWord !== undefined)
      this.config.customWord = config.customWord
  }
  start() {
    if (this.game) return null
    this.game = new Game(this.id, this.memberList, this.config.language)
    this.game.start()
  }
  selectWord(word: string) {
    if (!this.game) return null
    this.game.selectWord(word)
  }
  guess(member: Member, word: string) {
    if (!this.game) return
    this.game.guessWord(member, word)
  }
  skip(member: Member) {
    if (!this.game) return
    this.game.skip(member)
  }
  getInitialInfo(): RoomInfo {
    if (this.game) {
      return {
        config: this.getConfig(),
        member: this.getMemberList(),
        status: this.game.getStatus(),
        drawStatus: this.game.getCanvasFrame(),
      } as RoomInfo
    } else {
      return {
        config: this.getConfig(),
        member: this.getMemberList(),
      } as RoomInfo
    }
  }
}

class RoomManager {
  private roomTable: RoomTable // TODO: use Map
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
  joinRoom(id: string, member: MemberInRoom) {
    if (!this.roomTable[id]) return null
    this.roomTable[id].join(member)
    return this.roomTable[id].id
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
