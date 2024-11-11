const CreateComment = require('../CreateComment')

describe('a CreateComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      comment: 'abc'
    }

    // Action and Assert
    expect(() => new CreateComment(payload)).toThrowError('COMMENT.NOT_CONTAIN_NEEDED_PROPERTY')
  })

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      content: 123
    }

    // Action and Assert
    expect(() => new CreateComment(payload)).toThrowError('COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION')
  })

  it('should create comment object correctly', () => {
    // Arrange
    const payload = {
      content: 'sebuah comment'
    }

    // Action
    const comment = new CreateComment(payload)

    // Assert
    expect(comment.content).toEqual(payload.content)
  })
})
