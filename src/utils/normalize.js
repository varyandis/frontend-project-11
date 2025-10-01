export const withIds = (url, { feed, posts }, existingFeedId = null) => {
  const feedId = existingFeedId ?? crypto.randomUUID()

  const toStableId = p => (p.guid?.trim())
    || (p.link?.trim())
    || `${p.title?.trim() || ''}::${p.pubDate?.trim?.() || ''}`

  return {
    feed: {
      id: feedId,
      url,
      title: feed.title,
      description: feed.description,
    },
    posts: posts.map(p => ({
      id: toStableId(p),
      feedId,
      title: p.title,
      link: p.link,
      description: p.description,
      pubDate: p.pubDate ?? null,
    })),
  }
}
