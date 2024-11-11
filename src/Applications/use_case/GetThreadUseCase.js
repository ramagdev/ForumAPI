const ThreadDetail = require('../../Domains/threads/entities/ThreadDetail')
class GetThreadUseCase {
  constructor ({ threadRepository, commentRepository, replyRepository, userRepository }) {
    this._threadRepository = threadRepository
    this._commentRepository = commentRepository
    this._replyRepository = replyRepository
    this._userRepository = userRepository
  }

  async execute (threadId) {
    await this._threadRepository.verifyThreadAvailability(threadId)
    const thread = await this._threadRepository.getThreadById(threadId)
    thread.username = await this._userRepository.getUsernameById(thread.owner)

    const threadComments = await this._commentRepository.getThreadComments(threadId)

    for (const comment of threadComments) {
      if (comment.is_deleted) {
        comment.content = '**komentar telah dihapus**'
      }
      delete comment.is_deleted
      comment.username = await this._userRepository.getUsernameById(comment.owner)
    }
    const threadReplies = await this._replyRepository.getThreadReplies(threadId)
    for (const reply of threadReplies) {
      if (reply.is_deleted) {
        reply.content = '**balasan telah dihapus**'
      }
      delete reply.is_deleted
      reply.username = await this._userRepository.getUsernameById(reply.owner)
    }

    const threadDetail = new ThreadDetail({
      thread,
      threadComments,
      threadReplies
    })

    return threadDetail.formattedDetail
  }
}

module.exports = GetThreadUseCase
