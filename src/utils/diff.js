export const diffNewPosts = (existingPosts, incomingPosts) => {
  const knownIds = new Set(existingPosts.map(p => p.id))
  return incomingPosts.filter(p => !knownIds.has(p.id))
}
