interface Config extends RoomConfig, GameConfig {}

interface RoomConfig {
  isPrivate: boolaen
  language: AvailableLangugae
}

interface GameConfig {
  drawTime: number
  round: number
}

const GAME_STATUS = {
  PENDING: 0, // 로비 대기
  SELECTING_WORD: 1, // 단어 선택 중
  DRAWING: 2, // 그림 그리는 중
}
type GameStatus = (typeof GAME_STATUS)[keyof typeof GAME_STATUS]

type AvailableLangugae = 'ko' | 'en'

interface Member {
  id: string
  name: string
  isManager?: boolean
  score?: number
}

type BrushActionType = {
  type: 'BRUSH'
  color: string
  x: number
  y: number
  scale: number
}
type FillActionType = {
  type: 'FILL'
  color: 'string'
  x: number
  y: number
}
