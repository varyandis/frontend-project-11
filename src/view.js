export const renderForm = (state, elements) => {
  const { urlInput, feedback, submitButton } = elements
  const { status, error } = state.form

  if (error) {
    urlInput.classList.add('is-invalid')
    urlInput.setAttribute('aria-invalid', 'true')
    feedback.textContent = error
  }
  else {
    urlInput.classList.remove('is-invalid')
    urlInput.setAttribute('aria-invalid', 'false')
    feedback.textContent = ''
  }

  submitButton.disabled = status === 'validating'

  if (status === 'success') {
    elements.form.reset()
    urlInput.focus()
  }
}
