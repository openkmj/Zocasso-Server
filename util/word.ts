const WORDS = {
  ko: ['사과', '바나나', '호랑이', '강아지', '태양'],
  en: ['tiger', 'rabbit', 'robot', 'cow', 'dog', 'cat', 'cup', 'phone', 'cry'],
}

const getRandomWord = (lang: 'ko' | 'en') => {
  const idx = Math.floor(Math.random() * WORDS[lang].length)
  return WORDS[lang][idx]
}

export { getRandomWord }
