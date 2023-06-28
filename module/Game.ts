import { getRandomWord } from '../util/word'
import SocketManager from './SocketManager'

class Game {
  static SELECTING_WORD_TIME = 15 * 1000

  private config: GameConfig
  private status: GameStatus
  private memberList: Member[]
  private memberHistory: string[]
  private answer = ''
  stage = 0
  private language: AvailableLangugae
  activeUser: Member | null
  private timer: NodeJS.Timer | null

  constructor(
    memberList: Member[],
    language: AvailableLangugae,
    { drawTime, round }: GameConfig = { drawTime: 80, round: 3 }
  ) {
    this.memberList = memberList
    this.memberHistory = []
    this.config = {
      drawTime: drawTime ?? 80,
      round: round ?? 3,
    }
    this.status = GAME_STATUS.PENDING
    this.language = language
    this.activeUser = null
    this.timer = null
  }
  next(type: 'DRAW', x: number): void
  next(type: 'WORD', y: string): void
  next(type: 'DRAW' | 'WORD', value: number | string): void {}
  validateWord(word: string) {
    if (this.answer && word === this.answer) return true
    else return false
  }
  startWordPhase() {
    const m = this.getNextDrawer()
    const words = this.getThreeRandomWords()
    // active user - game status update with 3 words,
    // 나머지 - game status update.
    SocketManager.emitEvent({
      roomId: '',
      type: S2CEventType.STATUS_UPDATED,
      payload: {
        status: this.status,
      },
    })
    this.timer = setTimeout(() => {
      // start draw phase
    }, Game.SELECTING_WORD_TIME)
  }
  startDrawPhase(word: string) {
    if (this.status !== GAME_STATUS.SELECTING_WORD) return
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
    this.answer = word
    // active user - game status update with the word
    // 나머지 - game status update

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
    this.stage++
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
