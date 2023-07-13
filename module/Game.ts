import { randomPick } from '../util/random'
import { generateRoomId } from '../util/room'
import { getRandomWord } from '../util/word'
import SocketManager from './SocketManager'

class Game {
  static SELECTING_WORD_TIME = 15 * 1000

  private roomId: string
  private config: GameConfig
  private status: GameStatus
  private memberList: Member[]
  private memberHistory: string[]
  private answer = ''
  private language: AvailableLangugae
  activeUser: Member | null
  private timer: NodeJS.Timer | null

  constructor(
    id: string,
    memberList: Member[],
    language: AvailableLangugae,
    { drawTime, round }: GameConfig = { drawTime: 80, round: 3 }
  ) {
    this.roomId = id
    this.memberList = memberList
    this.memberHistory = []
    this.config = {
      drawTime: drawTime ?? 80,
      round: round ?? 3,
    }
    this.status = 'PENDING'
    this.language = language
    this.activeUser = null
    this.timer = null
  }
  validateWord(word: string) {
    if (this.answer && word === this.answer) return true
    else return false
  }
  startWordPhase() {
    if (!SocketManager.io) return
    const m = this.getNextDrawer()
    const words = this.getThreeRandomWords()
    // active user - game status update with 3 words,
    SocketManager.emitEvent({
      roomId: m.id,
      type: S2CEventType.STATUS_UPDATED,
      payload: {
        status: 'SELECTING_WORD',
        words: words,
      },
    })
    // 나머지 - game status update.
    SocketManager.io
      .in(generateRoomId(this.roomId))
      .except(m.id)
      .emit(S2CEventType.STATUS_UPDATED, {
        status: 'SELECTING_WORD',
      })
    this.status = 'SELECTING_WORD'

    this.timer = setTimeout(() => {
      const word = randomPick(words)
      if (!word) return
      this.startDrawPhase(word)

      // start draw phase
    }, Game.SELECTING_WORD_TIME)
  }
  startDrawPhase(word: string) {
    if (this.status !== 'SELECTING_WORD') return
    if (!this.activeUser) return
    this.status = 'DRAWING'
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
    this.answer = word
    // active user - game status update with the word
    SocketManager.emitEvent({
      roomId: this.activeUser.id,
      type: S2CEventType.STATUS_UPDATED,
      payload: {
        status: 'DRAWING',
        words: [word],
      },
    })
    // 나머지 - game status update
    SocketManager.io
      ?.in(generateRoomId(this.roomId))
      .except(this.activeUser.id)
      .emit(S2CEventType.STATUS_UPDATED, {
        status: 'DRAWING',
      })
    this.timer = setTimeout(() => {
      // start word phase
    }, this.config.drawTime * 1000)
  }
  getNextDrawer() {
    for (let i = 0; i < this.memberList.length; i++) {
      if (this.memberHistory.find((id) => id !== this.memberList[i].id)) {
        this.memberHistory.push(this.memberList[i].id)
        this.activeUser = this.memberList[i]
        return this.memberList[i]
      }
    }
    this.memberHistory = [this.memberList[0].id]
    this.activeUser = this.memberList[0]
    return this.memberList[0]
  }
  getThreeRandomWords() {
    return [
      getRandomWord(this.language),
      getRandomWord(this.language),
      getRandomWord(this.language),
    ]
  }
  endGame() {}
}

export default Game
