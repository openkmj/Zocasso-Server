type SocketRoomId = `ROOMS-${string}` | string

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
interface MemberDetail extends Member {
  isManager: boolean
  score: number
  status: 'DRAW' | 'SKIP' | 'PASS' | 'NONE'
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
