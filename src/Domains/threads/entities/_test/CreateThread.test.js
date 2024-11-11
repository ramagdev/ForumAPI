const CreateThread = require('../CreateThread')

describe('a CreateThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      title: 'abc'
    }

    // Action and Assert
    expect(() => new CreateThread(payload)).toThrowError('THREAD.NOT_CONTAIN_NEEDED_PROPERTY')
  })

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      title: 123,
      body: true
    }

    // Action and Assert
    expect(() => new CreateThread(payload)).toThrowError('THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION')
  })

  it('should create thread object correctly', () => {
    // Arrange
    const payload = {
      title: 'dicoding',
      body: 'Dicoding Indonesia'
    }

    // Action
    const { title, body } = new CreateThread(payload)

    // Assert
    expect(title).toEqual(payload.title)
    expect(body).toEqual(payload.body)
  })
})
