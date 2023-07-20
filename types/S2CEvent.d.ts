declare const enum S2CEventType {
  CHATTING_UPDATED = 'CHATTING_UPDATED',
  MEMBER_UPDATED = 'MEMBER_UPDATED',
  STATUS_UPDATED = 'STATUS_UPDATED',
  SETTING_UPDATED = 'SETTING_UPDATED',
  CANVAS_UPDATED = 'CANVAS_UPDATED',
}

declare type S2CEvent =
  | {
      roomId: SocketRoomId
      type: S2CEventType.CHATTING_UPDATED
      payload: ChattingUpdatedPayload
    }
  | {
      roomId: SocketRoomId
      type: S2CEventType.MEMBER_UPDATED
      payload: MemberUpdatedPayload
    }
  | {
      roomId: SocketRoomId
      type: S2CEventType.STATUS_UPDATED
      payload: StatusUpdatedPayload
    }
  | {
      roomId: SocketRoomId
      type: S2CEventType.SETTING_UPDATED
      payload: SettingUpdatedPayload
    }
  | {
      roomId: SocketRoomId
      type: S2CEventType.CANVAS_UPDATED
      payload: CanvasUpdatedPayload
    }

type ChattingUpdatedPayload = {
  type: 'SYS' | 'USR'
  member?: Member
  text: string
}
type MemberUpdatedPayload = {
  memberList: Member[]
}
type StatusUpdatedPayload = {
  status: GameStatus
  words?: string[]
}
type SettingUpdatedPayload = {
  config: Config
}
type CanvasUpdatedPayload = {
  actions: (BrushActionType | FillActionType)[]
}
