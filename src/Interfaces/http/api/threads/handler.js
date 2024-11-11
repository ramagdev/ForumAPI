const AddThreadUseCase = require('../../../../Applications/use_case/AddThreadUseCase')
const GetThreadUseCase = require('../../../../Applications/use_case/GetThreadUseCase.js')

class ThreadsHandler {
  constructor (container) {
    this._container = container

    this.postThreadHandler = this.postThreadHandler.bind(this)
    this.getThreadByIdHandler = this.getThreadByIdHandler.bind(this)
  }

  async postThreadHandler (request, h) {
    const { id: userId } = request.auth.credentials

    const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name)
    const addedThread = await addThreadUseCase.execute(userId, request.payload)

    const response = h.response({
      status: 'success',
      data: {
        addedThread
      }
    })
    response.code(201)
    return response
  }

  async getThreadByIdHandler (request) {
    const { threadId } = request.params
    const getThreadByIdUseCase = this._container.getInstance(GetThreadUseCase.name)
    const threadDetail = await getThreadByIdUseCase.execute(threadId)
    return {
      status: 'success',
      data: threadDetail
    }
  }
}

module.exports = ThreadsHandler
