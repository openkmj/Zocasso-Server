type AvailableLangugae = 'ko' | 'en'

interface Member {
  id: string
  name: string
  isManager: boolean
  score?: number
}

export { AvailableLangugae, Member }
