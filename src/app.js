import onChange from 'on-change'
import { renderForm } from './view'

export const initApp = () => {
  const state = {
    form: {
      status: 'filling',
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
}
