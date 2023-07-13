import { Router } from 'express'
import { createRoom, getRoom, joinRoom } from '../controller/room'

const room = Router()

room.get('/:id', getRoom)
room.post('/join', joinRoom)
room.post('/', createRoom)

export default room
