export const renderForm = (state, elements, t) => {
  const { urlInput, feedback, submitButton, form } = elements
  const { status, error, successKey } = state.form

  urlInput.placeholder = t('app.form.placeholder')
  submitButton.textContent = t('app.form.submit')

  if (status === 'validating') {
    urlInput.disabled = true
    submitButton.disabled = true
    form.setAttribute('aria-busy', 'true')

    urlInput.classList.remove('is-invalid')
    urlInput.setAttribute('aria-invalid', 'false')

    feedback.classList.remove('text-danger', 'text-success')
    feedback.classList.add('text-muted')
    feedback.textContent = t('status.loading')
    return
  }

  urlInput.disabled = false
  submitButton.disabled = false
  form.removeAttribute('aria-busy')

  if (error) {
    urlInput.classList.add('is-invalid')
    urlInput.setAttribute('aria-invalid', 'true')

    feedback.classList.remove('text-success', 'text-muted')
    feedback.classList.add('text-danger')
    feedback.textContent = t(error)
  }
  else if (status === 'success' && successKey) {
    urlInput.classList.remove('is-invalid')
    urlInput.setAttribute('aria-invalid', 'false')

    feedback.classList.remove('text-danger', 'text-muted')
    feedback.classList.add('text-success')
    feedback.textContent = t(successKey)

    form.reset()
    urlInput.focus()
  }
  else {
    urlInput.classList.remove('is-invalid')
    urlInput.setAttribute('aria-invalid', 'false')

    feedback.classList.remove('text-danger', 'text-success', 'text-muted')
    feedback.textContent = ''
  }
}

export const renderFeeds = (feeds, elements, t) => {
  const { feedsContainer } = elements
  feedsContainer.innerHTML = ''
  if (feeds.length === 0) return

  const card = document.createElement('div')
  card.className = 'card border-0'

  const cardBody = document.createElement('div')
  cardBody.className = 'card-body'

  const title = document.createElement('h2')
  title.className = 'card-title h4'
  title.textContent = t('feeds.title')

  cardBody.append(title)
  card.append(cardBody)

  const ul = document.createElement('ul')
  ul.className = 'list-group list-group-flush'

  feeds.forEach((feed) => {
    const li = document.createElement('li')
    li.className = 'list-group-item border-0 border-end-0'

    const h3 = document.createElement('h3')
    h3.className = 'h6 m-0'
    h3.textContent = feed.title

    const p = document.createElement('p')
    p.className = 'm-0 small text-black-50'
    p.textContent = feed.description

    li.append(h3, p)
    ul.append(li)
  })

  card.append(ul)
  feedsContainer.append(card)
}

export const renderPosts = (posts, elements, t, readPostIds = new Set()) => {
  const { postsContainer } = elements
  postsContainer.innerHTML = ''
  if (posts.length === 0) return

  const card = document.createElement('div')
  card.className = 'card border-0'

  const cardBody = document.createElement('div')
  cardBody.className = 'card-body'

  const title = document.createElement('h2')
  title.className = 'card-title h4'
  title.textContent = t('posts.title')

  cardBody.append(title)
  card.append(cardBody)

  const ul = document.createElement('ul')
  ul.className = 'list-group border-0 rounded-0'

  posts.forEach((post) => {
    const li = document.createElement('li')
    li.className = 'list-group-item d-flex justify-content-between align-items-start border-0 border-end-0 border-start-0'

    const isRead = readPostIds.has(post.id)

    const a = document.createElement('a')
    a.href = post.link
    a.target = '_blank'
    a.rel = 'noopener noreferrer'
    a.className = isRead ? 'fw-normal' : 'fw-bold'
    a.textContent = post.title
    a.dataset.id = post.id

    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'btn btn-outline-primary btn-sm'
    btn.dataset.role = 'preview'
    btn.dataset.id = post.id
    btn.setAttribute('data-bs-toggle', 'modal')
    btn.setAttribute('data-bs-target', '#modal')
    btn.textContent = t('posts.preview')

    li.append(a, btn)
    ul.append(li)
  })

  card.append(ul)
  postsContainer.append(card)
}

export const renderModal = (state, elements) => {
  const id = state.ui.modal.postId
  if (!id) return
  const post = state.posts.find(p => p.id === id)
  if (!post) return

  elements.modalTitle.textContent = post.title
  elements.modalBody.textContent = post.description ?? ''
  elements.modalLink.href = post.link
}
