class CommentRepository {
  async addComment (userId, threadId, createComment) {
    throw new Error('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED')
  }

  async deleteComment (commentId) {
    throw new Error('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED')
  }

  async verifyCommentAvailability (commentId) {
    throw new Error('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED')
  }

  async verifyCommentOwner (commentId) {
    throw new Error('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED')
  }

  async getThreadComments (threadId) {
    throw new Error('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED')
  }
}

module.exports = CommentRepository
