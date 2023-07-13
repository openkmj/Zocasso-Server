const generateRoomId = (id: string) => {
  return `ROOMS-${id}`
}

const getRoomId = (rooms: Set<string>) => {
  let room = ''
  for (let i of rooms) {
    if (i.includes('ROOMS-')) {
      room = i
    }
  }
  return room
}
const getUserId = (rooms: any) => {
  let room = ''
  for (let i of rooms) {
    if (!i.includes('ROOMS-')) {
      room = i
    }
  }
  return room
}

export { generateRoomId, getRoomId, getUserId }
