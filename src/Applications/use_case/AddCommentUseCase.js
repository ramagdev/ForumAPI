const CreateComment = require('../../Domains/comments/entities/CreateComment.js')

class AddCommentUseCase {
  constructor ({
    commentRepository,
    threadRepository
  }) {
    this._commentRepository = commentRepository
    this._threadRepository = threadRepository
  }

  async execute (userId, threadId, useCasePayload) {
    const createComment = new CreateComment(useCasePayload)
    await this._threadRepository.verifyThreadAvailability(threadId)
    const response = await this._commentRepository.addComment(userId, threadId, createComment)
    return response
  }
}

module.exports = AddCommentUseCase
