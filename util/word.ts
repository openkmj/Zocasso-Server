import en from './words/en'
import ko from './words/ko'

const WORDS = {
  en,
  ko,
}

const getRandomWord = (lang: 'ko' | 'en') => {
  const idx = Math.floor(Math.random() * WORDS[lang].length)
  return WORDS[lang][idx]
}

export { getRandomWord }
