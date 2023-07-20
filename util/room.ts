const generateRoomId = (id: string): SocketRoomId => {
  return `ROOMS-${id}`
}

const getRoomId = (rooms: Set<string>): SocketRoomId | null => {
  let room = ''
  for (let i of rooms) {
    if (i.includes('ROOMS-')) {
      room = i
    }
  }
  if (!room) return null
  return room
}
const getUserId = (rooms: Set<string>): string => {
  let room = ''
  for (let i of rooms) {
    if (!i.includes('ROOMS-')) {
      room = i
    }
  }
  return room
}

export { generateRoomId, getRoomId, getUserId }
