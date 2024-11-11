const AddedThread = require('../../../Domains/threads/entities/AddedThread')
const ThreadRepository = require('../../../Domains/threads/ThreadRepository')
const AddThreadUseCase = require('../AddThreadUseCase')

describe('AddThreadUseCase', () => {
  /**
     * Menguji apakah use case mampu menambahkan thread dengan benar.
     */
  it('should add thread correctly', async () => {
    // Arrange
    const useCasePayload = {
      title: 'sebuah thread',
      body: 'sebuah body thread'
    }

    const userId = 'user-123'

    const mockAddedThread = new AddedThread({
      id: 'thread-123',
      title: useCasePayload.title,
      owner: userId
    })

    const expectedAddedThread = new AddedThread({
      id: 'thread-123',
      title: useCasePayload.title,
      owner: userId
    })

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository()

    /** mocking needed function */
    mockThreadRepository.addThread = jest.fn()
      .mockImplementation(() => Promise.resolve(mockAddedThread))

    /** creating use case instance */
    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository
    })

    // Action
    const addedThread = await addThreadUseCase.execute(userId, useCasePayload)

    // Assert
    expect(addedThread).toStrictEqual(expectedAddedThread)

    expect(mockThreadRepository.addThread)
      .toHaveBeenCalledWith(userId, useCasePayload)
  })
})
