import { Request, Response } from 'express'
import roomManager from '../module/RoomManager'

const createRoom = async (req: Request, res: Response) => {
  if (!req.uid) return
  const type = req.body.type === 0 ? 'PRIVATE' : 'PUBLIC'
  const roomId = roomManager.createRoom({ isPrivate: type === 'PRIVATE' })
  const roomInfo = roomManager.joinRoom(roomId, { id: '123', name: 'name' })
  return res.json({ room: roomInfo })
}

const joinRoom = async (req: Request, res: Response) => {
  if (!req.uid) return
  const roomId = req.params.id
  if (!roomManager.hasRoom(roomId))
    return res.status(404).json({
      message: 'No Such Room',
    })
  const roomInfo = roomManager.joinRoom(roomId, {
    id: '123',
    name: 'name',
  })
  return res.json({
    room: roomInfo,
  })
}

export { createRoom, joinRoom }
