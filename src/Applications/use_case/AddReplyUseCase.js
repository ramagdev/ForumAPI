const CreateReply = require('../../Domains/replies/entities/CreateReply')
class AddReplyUseCase {
  constructor ({ replyRepository, commentRepository, threadRepository }) {
    this.replyRepository = replyRepository
    this._commentRepository = commentRepository
    this._threadRepository = threadRepository
  }

  async execute (userId, threadId, commentId, useCasePayload) {
    const createReply = new CreateReply(useCasePayload)
    await this._threadRepository.verifyThreadAvailability(threadId)
    await this._commentRepository.verifyCommentAvailability(commentId)
    const response = await this.replyRepository.addReply(userId, threadId, commentId, createReply)
    return response
  }
}

module.exports = AddReplyUseCase
