const getRandomString = () => {
  return Math.random().toString(36).substring(2, 12)
}

const randomPick = <T>(array: T[]) => {
  if (!array.length) return
  const idx = Math.floor(Math.random() * array.length)
  return array[idx]
}

export { getRandomString, randomPick }
