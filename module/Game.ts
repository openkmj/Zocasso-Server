import { AvailableLangugae, Member } from '../util/const'

interface GameConfig {
  isPrivate: boolean
  language: AvailableLangugae
  drawTime: number
  round: number
}

const GAME_STATUS = {
  PENDING: 0, // 로비 대기
  SELECTING_WORD: 1, // 단어 선택 중
  DRAWING: 2, // 그림 그리는 중
}
type GameStatus = (typeof GAME_STATUS)[keyof typeof GAME_STATUS]

class Game {
  private config: GameConfig
  private status: GameStatus
  private memberList: Member[]
  private memberHistory: string[]
  private answer = ''
  private stage = 0

  constructor(
    memberList: Member[],
    { isPrivate = false, language = 'en', drawTime = 80, round = 3 }: GameConfig
  ) {
    this.memberList = memberList
    this.memberHistory = []
    this.config = {
      isPrivate,
      language,
      drawTime,
      round,
    }
    this.status = GAME_STATUS.PENDING
  }
  next(type: 'DRAW', x: number): void
  next(type: 'WORD', y: string): void
  next(type: 'DRAW' | 'WORD', value: number | string): void {}
  validateWord(word: string) {
    if (word === this.answer) return true
    else return false
  }
  getNextDrawer() {
    for (let i = 0; i < this.memberList.length; i++) {
      if (this.memberHistory.find((id) => id !== this.memberList[i].id))
        return this.memberList[i].id
    }
    return
  }
}
