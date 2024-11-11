const CreateReply = require('../CreateReply')

describe('CreateReply entities', () => {
  it('should throw error when payload not contain needed property', () => {
    const payload = {
      reply: 'content'
    }

    // Action and Assert
    expect(() => new CreateReply(payload)).toThrowError('CREATE_REPLY.NOT_CONTAIN_NEEDED_PROPERTY')
  })

  it('should throw error when payload not meet data type specification', () => {
    const payload = {
      content: 123
    }

    // Action and Assert
    expect(() => new CreateReply(payload)).toThrowError('CREATE_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION')
  })

  it('should create CreateReply entities correctly', () => {
    const payload = {
      content: 'sebuah reply'
    }

    // Action
    const createReply = new CreateReply(payload)

    // Assert
    expect(createReply.content).toEqual(payload.content)
  })
})
