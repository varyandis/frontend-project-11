import onChange from 'on-change'
import * as yup from 'yup'
import { i18n } from './i18n'
import { renderForm } from './view'

const FORM_STATUS = { FILLING: 'filling', VALIDATING: 'validating', SUCCESS: 'success', FAILED: 'failed' }

export const initApp = () => {
  const state = {
    form: {
      status: FORM_STATUS.FILLING,
      error: null,
      successKey: null,
    },
    feeds: [],
  }

  const form = document.querySelector('.rss-form')

  const elements = {
    form,
    urlInput: document.getElementById('url-input'),
    submitButton: form.querySelector('button[type="submit"]'),
    feedback: document.querySelector('.feedback'),
  }

  const t = i18n.t.bind(i18n)

  const watchedState = onChange(state, (path) => {
    if (path.startsWith('form')) {
      renderForm(watchedState, elements, t)
    }
  })

  yup.setLocale({
    string: {
      url: 'errors.url',
    },
    mixed: {
      notOneOf: 'errors.exists',
      required: 'errors.required',
    },
  })

  const makeSchema = existingUrls => yup.object({
    url: yup.string().trim().required().url().notOneOf(existingUrls),
  })

  const validateUrl = (url, existingUrls) => makeSchema(existingUrls).validate({ url })

  i18n.on('languageChanged', () => {
    renderForm(watchedState, elements, t)
  })

  form.addEventListener('submit', (e) => {
    e.preventDefault()

    const url = elements.urlInput.value.trim()

    watchedState.form.status = FORM_STATUS.VALIDATING
    watchedState.form.error = null
    watchedState.form.successKey = null

    const existingUrls = watchedState.feeds.map(f => f.url)

    validateUrl(url, existingUrls)
      .then(() => {
        watchedState.feeds = [...watchedState.feeds, { url }]
        watchedState.form.status = FORM_STATUS.SUCCESS
        watchedState.form.error = null
        watchedState.form.successKey = 'status.success'
      })
      .catch((err) => {
        watchedState.form.error = err.message
        watchedState.form.status = FORM_STATUS.FAILED
      })
  })

  elements.urlInput.addEventListener('input', () => {
    if (watchedState.form.error || watchedState.form.status !== FORM_STATUS.FILLING) {
      watchedState.form.error = null
      watchedState.form.successKey = null
      watchedState.form.status = FORM_STATUS.FILLING
    }
  })

  renderForm(watchedState, elements, t)
}
