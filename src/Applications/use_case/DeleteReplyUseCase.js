class DeleteReplyUseCase {
  constructor ({
    replyRepository,
    commentRepository,
    threadRepository
  }) {
    this._replyRepository = replyRepository
    this._commentRepository = commentRepository
    this._threadRepository = threadRepository
  }

  async execute (userId, threadId, commentId, replyId) {
    await this._threadRepository.verifyThreadAvailability(threadId)
    await this._commentRepository.verifyCommentAvailability(commentId)
    await this._replyRepository.verifyReplyAvailability(replyId)
    const ownerId = await this._replyRepository.verifyReplyOwner(replyId)

    if (userId !== ownerId) {
      throw new Error('DELETE_REPLY_USE_CASE.USER_IS_NOT_REPLY_OWNER')
    }

    await this._replyRepository.deleteReply(replyId)
  }
}

module.exports = DeleteReplyUseCase
