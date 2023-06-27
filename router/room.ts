import { Router } from 'express'
import { createRoom, joinRoom } from '../controller/room'
import checkToken from '../middleware/checkToken'

const room = Router()

room.get('/:roomId', joinRoom)
// room.get('/', checkToken, joinRoom)
room.post('/', createRoom)

export default room
