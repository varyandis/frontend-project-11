import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import { initApp } from './app.js'
import { initI18n, i18n } from './i18n'

initI18n()
  .then(() => {
    if (import.meta.env.DEV) {
      window.i18n = i18n
    }
    initApp()
  })
  .catch((e) => {
    console.error('i18n init failed', e)
  })
