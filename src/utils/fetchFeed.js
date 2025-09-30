import axios from 'axios'

export const fetchFeed = (url) => {
  return axios.get('https://allorigins.hexlet.app/get',
    {
      params: { url, disableCache: true },
    },
  )
    .then(response => response.data.contents)
}

export const parseRss = (xml) => {
  const doc = new DOMParser().parseFromString(xml, 'application/xml')

  if (doc.querySelector('parsererror')) {
    throw new Error('invalid_rss')
  }

  const channel = doc.querySelector('channel')
  if (!channel) throw new Error('invalid_rss')

  const feedTitle = channel.querySelector('title')?.textContent?.trim() || ''
  const feedDescription = channel.querySelector('description')?.textContent?.trim() || ''

  const posts = Array.from(doc.querySelectorAll('item')).map((item) => {
    const postTitle = item.querySelector('title')?.textContent?.trim() || ''
    const link = item.querySelector('link')?.textContent?.trim() || ''
    const postDescription = item.querySelector('description')?.textContent?.trim() || ''
    return { title: postTitle, link, description: postDescription }
  })

  return { feed: { title: feedTitle, description: feedDescription }, posts }
}
