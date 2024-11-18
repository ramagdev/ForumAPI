class UpdateLikeUseCase {
  constructor ({ likeRepository, commentRepository, threadRepository }) {
    this._likeRepository = likeRepository
    this._commentRepository = commentRepository
    this._threadRepository = threadRepository
  }

  async execute (credentialId, threadId, commentId) {
    await this._threadRepository.verifyThreadAvailability(threadId)
    await this._commentRepository.verifyCommentAvailability(commentId)
    await this._likeRepository.updateLike(commentId, credentialId)
  }
}

module.exports = UpdateLikeUseCase
