import logger from '../util/logger'
import { randomPick } from '../util/random'
import { generateRoomId } from '../util/room'
import { getRandomWord } from '../util/word'
import socketManager from './SocketManager'

class Game {
  static SELECTING_WORD_TIME = 15 * 1000

  private roomId: string
  private config: GameConfig
  private status: GameStatus
  private round = 1
  private memberList: MemberInGame[]
  private memberHistory: string[]
  private answer = ''
  private language: AvailableLangugae
  private scoreBuffer: string[]
  activeUser: MemberInGame | null
  private timer: NodeJS.Timer | null

  constructor(
    id: string,
    memberList: Member[],
    language: AvailableLangugae,
    { maxPlayer, drawTime, round, showWordLength, customWord }: GameConfig = {
      maxPlayer: 6,
      drawTime: 80,
      round: 3,
      showWordLength: true,
      customWord: false,
    }
  ) {
    this.roomId = id
    this.memberList = memberList.map((i) => ({
      isManager: false,
      score: 0,
      turnScore: 0,
      status: 'NONE',
      ...i,
    }))
    this.memberHistory = []
    this.scoreBuffer = []
    this.config = {
      maxPlayer: maxPlayer ?? 6,
      drawTime: drawTime ?? 80,
      round: round ?? 3,
      showWordLength: showWordLength ?? true,
      customWord: customWord ?? false,
    }
    this.language = language
    this.status = GameStatus.PENDING
    this.activeUser = null
    this.timer = null
  }
  private clear() {
    this.memberHistory = []
    this.scoreBuffer = []
    this.status = GameStatus.PENDING
    this.activeUser = null
    this.memberList.forEach((m) => {
      m.score = 0
      m.status = 'NONE'
    })
    if (this.timer) clearTimeout(this.timer)
    this.timer = null
  }
  private validateWord(word: string) {
    if (this.answer && word === this.answer) return true
    else return false
  }

  private endTurn() {
    // calculate score
    this.scoreBuffer.forEach((id, idx) => {
      const member = this.memberList.find((m) => m.id === id)
      if (!member) return
      member.turnScore = (this.memberList.length - 1 - idx) * 2
      member.score += (this.memberList.length - 1 - idx) * 2
    })
    if (!this.activeUser) return
    if (this.scoreBuffer.length >= this.memberList.length / 2) {
      this.activeUser.turnScore = this.scoreBuffer.length
      this.activeUser.score += this.scoreBuffer.length
    }

    // clear
    this.scoreBuffer = []
    this.memberList.forEach((m) => {
      m.status = 'NONE'
    })

    this.startWordPhase(this.memberList)
  }
  private isAllPassOrSkip() {
    return this.memberList.every((m) => m.status !== 'NONE')
  }

  /**
   * Try to guess the answer.
   * @param m player who try to guess the answer
   * @param word player's input
   * @returns void
   */
  guessWord(m: Member, word: string) {
    logger.log(`${this.answer} / ${word}`)
    if (!this.validateWord(word)) return
    const member = this.memberList.find((i) => i.id === m.id)
    if (!member || member.status !== 'NONE') return
    member.status = 'PASS'
    this.scoreBuffer.push(member.id)
    if (this.isAllPassOrSkip()) this.endTurn()
  }

  /**
   * Skip this turn.
   * @param m player who want to skip this turn
   * @returns void
   */
  skip(m: Member) {
    const member = this.memberList.find((i) => i.id === m.id)
    if (!member || member.status !== 'NONE') return
    member.status = 'SKIP'
    if (this.isAllPassOrSkip()) this.endTurn()
  }

  /**
   * Start new game.
   */
  start() {
    this.startWordPhase()
  }

  /**
   * Select word and start new drawing.
   * @param word selected word to draw this turn
   */
  selectWord(word: string) {
    this.startDrawPhase(word)
  }

  private startWordPhase(scoreBoard?: MemberForScore[]) {
    if (this.status === GameStatus.SELECTING_WORD) return
    this.status = GameStatus.SELECTING_WORD

    this.activeUser = this.getNextDrawer()
    if (!this.activeUser) {
      this.endGame(scoreBoard ?? this.memberList)
      return
    }
    this.activeUser.status = 'DRAW'
    const words = this.getThreeRandomWords()
    // active user - game status update with 3 words,
    socketManager.emitEvent({
      roomId: this.activeUser.id,
      type: S2CEventType.STATUS_UPDATED,
      payload: {
        status: GameStatus.SELECTING_WORD,
        words: words,
        turnResult: scoreBoard
          ? {
              answer: this.answer,
              scoreBoard,
            }
          : undefined,
      },
    })
    // 나머지 - game status update.
    socketManager.emitEvent(
      {
        roomId: generateRoomId(this.roomId),
        type: S2CEventType.STATUS_UPDATED,
        payload: {
          status: GameStatus.SELECTING_WORD,
          turnResult: scoreBoard
            ? {
                answer: this.answer,
                scoreBoard,
              }
            : undefined,
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

  private startDrawPhase(word: string) {
    if (this.status !== GameStatus.SELECTING_WORD) return
    if (!this.activeUser) return
    this.status = GameStatus.DRAWING
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
    this.answer = word
    // active user - game status update with the word
    socketManager.emitEvent({
      roomId: this.activeUser.id,
      type: S2CEventType.STATUS_UPDATED,
      payload: {
        status: GameStatus.DRAWING,
        word: word,
      },
    })
    // 나머지 - game status update
    socketManager.emitEvent(
      {
        roomId: generateRoomId(this.roomId),
        type: S2CEventType.STATUS_UPDATED,
        payload: {
          status: GameStatus.DRAWING,
        },
      },
      this.activeUser.id
    )
    this.timer = setTimeout(() => {
      this.endTurn()
      // start word phase
    }, this.config.drawTime * 1000)
  }
  private getNextDrawer() {
    for (let i = 0; i < this.memberList.length; i++) {
      if (!this.memberHistory.includes(this.memberList[i].id)) {
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
  private endGame(scoreBoard: MemberForScore[]) {
    socketManager.emitEvent({
      roomId: generateRoomId(this.roomId),
      type: S2CEventType.STATUS_UPDATED,
      payload: {
        status: GameStatus.PENDING,
        turnResult: {
          answer: this.answer,
          scoreBoard,
        }, // need filter?
      },
    })
    this.clear()
  }
}

export default Game
