declare const enum C2SEventType {
  JOIN = 'JOIN',
  CHAT = 'CHAT',
  UPDATE_SETTING = 'UPDATE_SETTING',
  START = 'START',
  SELECT_WORD = 'SELECT_WORD',
  DRAW = 'DRAW',
  KICK = 'KICK',
}

type JoinPayload = {
  roomId: string
  member: Member
}
type ChatPayload = {
  type: 'USR'
  member: Member
  text: string
}
type UpdateSettingPayload = {
  config: Config
}
type StartPayload = {}
type SelectWordPayload = {
  word: string
}
type DrawPayload = {
  actions: (BrushActionType | FillActionType)[]
}
type KickPayload = {
  member: Member
}
