const AddReplyUseCase = require('../../../../Applications/use_case/AddReplyUseCase.js')
const DeleteReplyUseCase = require('../../../../Applications/use_case/DeleteReplyUseCase.js')

class RepliesHandler {
  constructor (container) {
    this._container = container

    this.postReplyHandler = this.postReplyHandler.bind(this)
    this.deleteReplyHandler = this.deleteReplyHandler.bind(this)
  }

  async postReplyHandler (request, h) {
    const { id: credentialId } = request.auth.credentials
    const { threadId, commentId } = request.params

    const addReplyUseCase = this._container.getInstance(AddReplyUseCase.name)
    const addedReply = await addReplyUseCase.execute(credentialId, threadId, commentId, request.payload)
    const response = h.response({
      status: 'success',
      data: {
        addedReply
      }
    })
    response.code(201)
    return response
  }

  async deleteReplyHandler (request) {
    const { id: credentialId } = request.auth.credentials
    const { threadId, commentId, replyId } = request.params

    const deleteReplyUseCase = this._container.getInstance(DeleteReplyUseCase.name)
    await deleteReplyUseCase.execute(credentialId, threadId, commentId, replyId)
    return {
      status: 'success'
    }
  }
}

module.exports = RepliesHandler
