class ThreadDetail {
  constructor (payload) {
    this._verifyPayload(payload)

    this.thread = payload.thread
    this.threadComments = payload.threadComments
    this.threadReplies = payload.threadReplies
  }

  _verifyPayload (payload) {
    const { thread, threadComments, threadReplies } = payload

    if (!thread || !threadComments || !threadReplies) {
      throw new Error('THREAD_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY')
    }

    if (typeof thread !== 'object' || typeof threadComments !== 'object' || typeof threadReplies !== 'object') {
      throw new Error('THREAD_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION')
    }
  }

  get formattedDetail () {
    const newReplies = this.threadReplies.map((reply) => ({
      id: reply.id,
      content: reply.content,
      date: reply.date,
      username: reply.username,
      commentId: reply.comment_id
    }))

    const newComments = this.threadComments.map((comment) => ({
      id: comment.id,
      username: comment.username,
      date: comment.date,
      replies: newReplies.filter((reply) => reply.commentId === comment.id),
      content: comment.content
    }))

    for (const reply of newReplies) {
      delete reply.commentId
    }

    const { id, title, body, date, username } = this.thread

    const newDetail = {
      thread: {
        id,
        title,
        body,
        date,
        username,
        comments: newComments
      }
    }
    return newDetail
  }
}

module.exports = ThreadDetail
