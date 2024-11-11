class CreateReply {
  constructor (payload) {
    this._verifyPayload(payload)
    const { content } = payload
    this.content = content
  }

  _verifyPayload (payload) {
    const { content } = payload
    if (!content) {
      throw new Error('CREATE_REPLY.NOT_CONTAIN_NEEDED_PROPERTY')
    }
    if (typeof content !== 'string') {
      throw new Error('CREATE_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION')
    }
  }
}

module.exports = CreateReply
