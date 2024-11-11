class DeleteCommentUseCase {
  constructor ({
    commentRepository,
    threadRepository
  }) {
    this._commentRepository = commentRepository
    this._threadRepository = threadRepository
  }

  async execute (userId, threadId, commentId) {
    await this._threadRepository.verifyThreadAvailability(threadId)
    await this._commentRepository.verifyCommentAvailability(commentId)
    const ownerId = await this._commentRepository.verifyCommentOwner(commentId)

    if (userId !== ownerId) {
      throw new Error('DELETE_COMMENT_USE_CASE.USER_IS_NOT_COMMENT_OWNER')
    }

    await this._commentRepository.deleteComment(commentId)
  }
}

module.exports = DeleteCommentUseCase
