type SocketRoomId = `ROOMS-${string}` | string

interface RoomInfo {
  // Setting
  config: RoomConfig
  // Member
  member: MemberInGame[]
  // Status
  status?: GameStatus
  // Canvas Info
  drawStatus?: string
}

interface RoomConfig extends Partial<GameConfig> {
  isPrivate: boolean
  language: AvailableLangugae
}

interface GameConfig {
  maxPlayer: number
  drawTime: number
  round: number
  showWordLength: boolean
  customWord: boolean
}

declare const enum GameStatus {
  PENDING = 'PENDING',
  SELECTING_WORD = 'SELECTING_WORD',
  DRAWING = 'DRAWING',
}

type AvailableLangugae = 'ko' | 'en'

interface Member {
  id: string
  name: string
  character: number
}
interface MemberInRoom extends Member {
  isManager: boolean
}
interface MemberInGame extends MemberInRoom, MemberForScore {
  status: 'DRAW' | 'SKIP' | 'PASS' | 'NONE'
}
interface MemberForScore extends Member {
  score: number
  turnScore: number
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
