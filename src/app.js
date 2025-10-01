import onChange from 'on-change'
import * as yup from 'yup'
import { i18n } from './i18n'
import { renderForm, renderFeeds, renderPosts, renderModal } from './view'
import { fetchFeed, parseRss } from './utils/fetchFeed'
import { withIds } from './utils/normalize'
import { scheduleUpdateLoop } from './utils/update'

const FORM_STATUS = { FILLING: 'filling', VALIDATING: 'validating', SUCCESS: 'success', FAILED: 'failed' }

export const initApp = () => {
  const state = {
    form: {
      status: FORM_STATUS.FILLING,
      error: null,
      successKey: null,
    },
    feeds: [],
    posts: [],
    ui: {
      modal: { postId: null },
      readPostIds: new Set(),
    },
  }

  const form = document.querySelector('.rss-form')

  const elements = {
    form,
    urlInput: document.getElementById('url-input'),
    submitButton: form.querySelector('button[type="submit"]'),
    feedback: document.querySelector('.feedback'),
    feedsContainer: document.querySelector('.feeds'),
    postsContainer: document.querySelector('.posts'),
    modal: document.getElementById('modal'),
    modalTitle: document.querySelector('#modal .modal-title'),
    modalBody: document.querySelector('#modal .modal-body'),
    modalLink: document.querySelector('#modal .full-article'),
  }

  const t = i18n.t.bind(i18n)

  const watchedState = onChange(state, (path) => {
    if (path.startsWith('form')) {
      renderForm(watchedState, elements, t)
    }
    if (path === 'feeds' || path.startsWith('feeds')) {
      renderFeeds(watchedState.feeds, elements, t)
    }
    if (
      path === 'posts' || path.startsWith('posts') || path === 'ui.readPostIds' || path === 'ui.modal.postId'
    ) {
      renderPosts(watchedState.posts, elements, t, watchedState.ui.readPostIds)
      renderModal(watchedState, elements, t)
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
    renderFeeds(watchedState.feeds, elements, t)
    renderPosts(watchedState.posts, elements, t, watchedState.ui.readPostIds)
  })

  const errorToKey = (err) => {
    if (err instanceof yup.ValidationError || err?.name === 'ValidationError') {
      return err.message
    }

    if (err?.message === 'invalid_rss') return 'errors.parse'

    if (err?.isAxiosError || err?.code === 'ERR_NETWORK') return 'errors.network'

    return 'errors.unknown'
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault()

    const url = elements.urlInput.value.trim()

    watchedState.form.status = FORM_STATUS.VALIDATING
    watchedState.form.error = null
    watchedState.form.successKey = null

    const existingUrls = watchedState.feeds.map(f => f.url)

    validateUrl(url, existingUrls)
      .then(() => {
        watchedState.form.status = FORM_STATUS.VALIDATING
        return fetchFeed(url)
      })
      .then(parseRss)
      .then(parsed => withIds(url, parsed))
      .then(({ feed, posts }) => {
        console.log('FEED:', feed)
        console.log('POSTS COUNT:', posts.length)

        watchedState.feeds.push(feed)
        watchedState.posts.push(...posts)
        watchedState.form.status = FORM_STATUS.SUCCESS
        watchedState.form.error = null
        watchedState.form.successKey = 'status.success'
        elements.urlInput.focus()
      })
      .catch((err) => {
        watchedState.form.status = FORM_STATUS.FAILED
        watchedState.form.error = errorToKey(err)
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

  elements.postsContainer.addEventListener('click', (e) => {
    const link = e.target.closest('a[data-id]')
    if (!link) return
    const postId = link.dataset.id
    const next = new Set(watchedState.ui.readPostIds)
    next.add(postId)
    watchedState.ui.readPostIds = next
  })

  elements.postsContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-role="preview"]')
    if (!btn) return
    const postId = btn.dataset.id

    const next = new Set(watchedState.ui.readPostIds)
    next.add(postId)
    watchedState.ui.readPostIds = next

    watchedState.ui.modal.postId = postId
  })

  const stopPolling = scheduleUpdateLoop(watchedState, { intervalMs: 5000, jitterMs: 300 })
  watchedState.runtime = { stopPolling }

  fetchFeed('https://lorem-rss.hexlet.app/feed')
    .then(parseRss)
    .then(({ feed, posts }) => {
      console.log('feed:', feed)
      console.log('posts count:', posts.length)
      console.log('first post:', posts[0])
    })
    .catch((err) => {
      console.error(err)
    })
}
