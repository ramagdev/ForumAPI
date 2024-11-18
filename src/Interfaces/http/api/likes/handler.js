const UpdateLikeUseCase = require('../../../../Applications/use_case/UpdateLikeUseCase')
class LikesHandler {
  constructor (container) {
    this._container = container

    this.putLikeHandler = this.putLikeHandler.bind(this)
  }

  async putLikeHandler (request, h) {
    const { id: credentialId } = request.auth.credentials
    const { threadId, commentId } = request.params

    const updateLikeUseCase = this._container.getInstance(UpdateLikeUseCase.name)
    await updateLikeUseCase.execute(credentialId, threadId, commentId)

    return {
      status: 'success'
    }
  }
}

module.exports = LikesHandler
