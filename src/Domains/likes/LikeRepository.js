class LikeRepository {
  async updateLike (commentId, userId) {
    throw new Error('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED')
  }

  async getLikeCount (commentId) {
    throw new Error('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED')
  }
}

module.exports = LikeRepository
