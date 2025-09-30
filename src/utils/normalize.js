export const withIds = (url, { feed, posts }) => {
  const feedId = crypto.randomUUID()

  return {
    feed: {
      id: feedId,
      url,
      title: feed.title,
      description: feed.description,
    },
    posts: posts.map(p => ({
      id: crypto.randomUUID(),
      feedId,
      title: p.title,
      link: p.link,
      description: p.description,
    })),
  }
}
