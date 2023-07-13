interface RoomConfig extends Partial<GameConfig> {
  isPrivate: boolean
  language: AvailableLangugae
}

interface GameConfig {
  drawTime: number
  round: number
}

type GameStatus = 'PENDING' | 'SELECTING_WORD' | 'DRAWING'

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
