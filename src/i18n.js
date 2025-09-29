import i18next from 'i18next'
import ru from './locales/ru.json'
import en from './locales/en.json'

export const i18n = i18next.createInstance()

export function initI18n() {
  return i18n.init({
    lng: 'ru',
    fallbackLng: 'en',
    resources: {
      ru: { translation: ru },
      en: { translation: en },
    },
    returnNull: false,
  })
}
