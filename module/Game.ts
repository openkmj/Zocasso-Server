import { randomPick } from '../util/random'
import { generateRoomId } from '../util/room'
import { getRandomWord } from '../util/word'
import SocketManager from './SocketManager'

class Game {
  static SELECTING_WORD_TIME = 15 * 1000

  private roomId: string
  private config: GameConfig
  private status: GameStatus
  private round = 0
  private memberList: MemberDetail[]
  private memberHistory: string[]
  private answer = ''
  private language: AvailableLangugae
  private scoreBuffer: string[]
  activeUser: MemberDetail | null
  private timer: NodeJS.Timer | null

  constructor(
    id: string,
    memberList: Member[],
    language: AvailableLangugae,
    { drawTime, round }: GameConfig = { drawTime: 80, round: 3 }
  ) {
    this.roomId = id
    this.memberList = memberList.map((i) => ({
      isManager: false,
      score: 0,
      status: 'NONE',
      ...i,
    }))
    this.memberHistory = []
    this.scoreBuffer = []
    this.config = {
      drawTime: drawTime ?? 80,
      round: round ?? 3,
    }
    this.status = 'PENDING'
    this.language = language
    this.activeUser = null
    this.timer = null
  }
  clear() {
    this.memberHistory = []
    this.status = 'PENDING'
    this.activeUser = null
    this.memberList.forEach((m) => {
      m.score = 0
      m.status = 'NONE'
    })
    if (this.timer) clearTimeout(this.timer)
    this.timer = null
  }
  validateWord(word: string) {
    if (this.answer && word === this.answer) return true
    else return false
  }
  endDraw() {
    // calculate score
    this.scoreBuffer.forEach((id, idx) => {
      const member = this.memberList.find((m) => m.id === id)
      if (!member) return
      member.score += (this.memberList.length - 1 - idx) * 2
    })
    if (!this.activeUser) return
    if (this.scoreBuffer.length >= this.memberList.length / 2)
      this.activeUser.score += this.scoreBuffer.length

    // emit score?
    this.startWordPhase()
  }
  private isAllPassOrSkip() {
    return this.memberList.every((m) => m.status !== 'NONE')
  }

  guessWord(m: Member, word: string) {
    if (!this.answer || word !== this.answer) return
    const member = this.memberList.find((i) => i.id === m.id)
    if (!member) return
    member.status = 'PASS'
    this.scoreBuffer.push(member.id)
    if (this.isAllPassOrSkip()) this.endDraw()
  }

  skip(memberId: string) {
    const member = this.memberList.find((i) => i.id === memberId)
    if (!member) return
    member.status = 'SKIP'
    if (this.isAllPassOrSkip()) this.endDraw()
  }

  startWordPhase() {
    if (this.status === 'SELECTING_WORD') return
    this.status = 'SELECTING_WORD'
    this.memberList.forEach((m) => {
      m.status = 'NONE'
    })
    this.activeUser = this.getNextDrawer()
    if (!this.activeUser) {
      this.endGame()
      return
    }
    this.activeUser.status = 'DRAW'
    const words = this.getThreeRandomWords()
    // active user - game status update with 3 words,
    SocketManager.emitEvent({
      roomId: this.activeUser.id,
      type: S2CEventType.STATUS_UPDATED,
      payload: {
        status: 'SELECTING_WORD',
        words: words,
      },
    })
    // 나머지 - game status update.
    SocketManager.emitEventExcept(
      {
        roomId: generateRoomId(this.roomId),
        type: S2CEventType.STATUS_UPDATED,
        payload: {
          status: 'SELECTING_WORD',
        },
      },
      this.activeUser.id
    )

    this.timer = setTimeout(() => {
      const word = randomPick(words)
      if (!word) return
      this.startDrawPhase(word)
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
    SocketManager.emitEventExcept(
      {
        roomId: generateRoomId(this.roomId),
        type: S2CEventType.STATUS_UPDATED,
        payload: {
          status: 'DRAWING',
        },
      },
      this.activeUser.id
    )
    this.timer = setTimeout(() => {
      // start word phase
    }, this.config.drawTime * 1000)
  }
  private getNextDrawer() {
    for (let i = 0; i < this.memberList.length; i++) {
      if (this.memberHistory.find((id) => id !== this.memberList[i].id)) {
        this.memberHistory.push(this.memberList[i].id)
        return this.memberList[i]
      }
    }
    if (this.round === this.config.round) return null
    this.memberHistory = [this.memberList[0].id]
    this.round++
    return this.memberList[0]
  }
  private getThreeRandomWords() {
    return [
      getRandomWord(this.language),
      getRandomWord(this.language),
      getRandomWord(this.language),
    ]
  }
  private endGame() {
    const ranking = [...this.memberList].sort((a, b) => a.score - b.score)
    // emit event
    this.clear()
  }
}

export default Game
