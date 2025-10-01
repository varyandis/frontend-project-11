import { fetchFeed, parseRss } from './fetchFeed'
import { diffNewPosts } from './diff'
import { withIds } from './normalize'

export const updateAllFeeds = async (state) => {
  const { feeds } = state
  if (feeds.length === 0) return

  const results = await Promise.allSettled(
    feeds.map(async (feed) => {
      const { url, id: feedId } = feed
      const parsed = await fetchFeed(url).then(parseRss)
      const { posts } = withIds(url, parsed, feedId)
      return { feedId, posts }
    }),
  )

  const newPosts = []
  for (const r of results) {
    if (r.status === 'fulfilled') {
      const diff = diffNewPosts(state.posts, r.value.posts)
      if (diff.length) newPosts.push(...diff)
    }
  }

  if (newPosts.length) state.posts.unshift(...newPosts)
}

export const scheduleUpdateLoop = (state, { intervalMs = 5000, jitterMs = 400 } = {}) => {
  let stopped = false
  let timerId = null

  const planNext = () => {
    if (stopped) return
    const jitter = Math.floor(Math.random() * (jitterMs * 2 + 1)) - jitterMs
    const delay = Math.max(0, intervalMs + jitter)
    timerId = setTimeout(tick, delay)
  }

  const tick = async () => {
    try {
      await updateAllFeeds(state)
    }
    finally {
      planNext()
    }
  }

  planNext()

  return () => {
    stopped = true
    if (timerId) clearTimeout(timerId)
  }
}
