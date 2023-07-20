import { Request, Response } from 'express'
import roomManager from '../module/RoomManager'

const getRoom = async (req: Request, res: Response) => {
  console.log(req.params)
  if (!req.params.id) return res.status(404).json()
  const room = roomManager.getRoom(req.params.id)
  if (!room) return res.status(404).json()
  return res.json({
    id: room.id,
    member_count: room.getMemberList().length,
    max_member_count: 10, // TODO
    is_private: room.getConfig().isPrivate,
    language: room.getConfig().language,
  })
}

const createRoom = async (req: Request, res: Response) => {
  const type = req.body.is_private ? 'PRIVATE' : 'PUBLIC'
  const lang = req.body.language === 'ko' ? 'ko' : 'en'
  const roomId = roomManager.createRoom({
    isPrivate: type === 'PRIVATE',
    language: lang,
  })
  return res.json({ room_id: roomId })
}

const joinRoom = async (req: Request, res: Response) => {
  const roomId = req.body.room_id
  if (roomId) {
    if (!roomManager.hasRoom(roomId))
      return res.status(404).json({
        message: 'No Such Room',
      })
    return res.json({
      room_id: roomId,
    })
  } else {
    const roomId = roomManager.getAvailableRoom('ko')
    return res.json({ room_id: roomId })
  }
}

export { getRoom, createRoom, joinRoom }
