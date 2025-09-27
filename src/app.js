import onChange from 'on-change'
import { renderForm } from './view'
import * as yup from 'yup'

const FORM_STATUS = { FILLING: 'filling', VALIDATING: 'validating', SUCCESS: 'success', FAILED: 'failed' }

export const initApp = () => {
  const state = {
    form: {
      status: FORM_STATUS.FILLING,
      error: null,
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

  const watchedState = onChange(state, (path) => {
    if (path.startsWith('form')) {
      renderForm(watchedState, elements)
    }
  })

  const makeSchema = (existingUrls) => {
    return yup.object({
      url: yup.string()
        .trim()
        .url('Ссылка должна быть валидным URL')
        .notOneOf(existingUrls, 'RSS уже существует'),
    })
  }

  const validateUrl = (url, existingUrls) => {
    return makeSchema(existingUrls).validate({ url })
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault()

    const url = elements.urlInput.value.trim()

    watchedState.form.status = FORM_STATUS.VALIDATING
    watchedState.form.error = null

    const existingUrls = watchedState.feeds.map(feed => feed.url)

    validateUrl(url, existingUrls).then(() => {
      watchedState.feeds = [...watchedState.feeds, { url }]
      watchedState.form.error = null
      watchedState.form.status = FORM_STATUS.SUCCESS
    }).catch((error) => {
      watchedState.form.error = error.message
      watchedState.form.status = FORM_STATUS.FAILED
    })
  })

  elements.urlInput.addEventListener('input', () => {
    if (watchedState.form.error || watchedState.form.status !== FORM_STATUS.FILLING) {
      watchedState.form.error = null
      watchedState.form.status = FORM_STATUS.FILLING
    }
  })
}
