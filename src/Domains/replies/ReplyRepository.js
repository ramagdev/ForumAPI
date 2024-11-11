class ReplyRepository {
  async addReply (reply) {
    throw new Error('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED')
  }

  async deleteReply (replyId) {
    throw new Error('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED')
  }

  async verifyReplyAvailability (replyId) {
    throw new Error('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED')
  }

  async verifyReplyOwner (replyId) {
    throw new Error('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED')
  }

  async getThreadReplies (threadId) {
    throw new Error('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED')
  }
}

module.exports = ReplyRepository
