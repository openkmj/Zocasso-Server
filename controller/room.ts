import { Request, Response } from 'express'
import roomManager from '../module/RoomManager'

const createRoom = async (req: Request, res: Response) => {
  const type = req.body.private ? 'PRIVATE' : 'PUBLIC'
  const lang = req.body.language === 'ko' ? 'ko' : 'en'
  const roomId = roomManager.createRoom({
    isPrivate: type === 'PRIVATE',
    language: lang,
  })
  const r = roomManager.joinRoom(roomId, { id: '123', name: 'name' })
  return res.json({ roomId: r })
}

const joinRoom = async (req: Request, res: Response) => {
  const roomId = req.params.id
  if (!roomManager.hasRoom(roomId))
    return res.status(404).json({
      message: 'No Such Room',
    })
  const r = roomManager.joinRoom(roomId, {
    id: '123',
    name: 'name',
  })
  return res.json({
    roomId: r,
  })
}

export { createRoom, joinRoom }
