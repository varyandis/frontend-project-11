// src/view.js
export const renderForm = (state, elements, t) => {
  const { urlInput, feedback, submitButton, form } = elements
  const { status, error, successKey } = state.form

  urlInput.placeholder = t('app.form.placeholder')
  submitButton.textContent = t('app.form.submit')

  if (error) {
    urlInput.classList.add('is-invalid')
    urlInput.setAttribute('aria-invalid', 'true')
    feedback.classList.remove('text-success')
    feedback.classList.add('text-danger')
    feedback.textContent = t(error)
  }
  else if (status === 'success' && successKey) {
    urlInput.classList.remove('is-invalid')
    urlInput.setAttribute('aria-invalid', 'false')
    feedback.classList.remove('text-danger')
    feedback.classList.add('text-success')
    feedback.textContent = t(successKey)
    form.reset()
    urlInput.focus()
  }
  else {
    urlInput.classList.remove('is-invalid')
    urlInput.setAttribute('aria-invalid', 'false')
    feedback.textContent = ''
  }

  submitButton.disabled = status === 'validating'
}
