const AddedComment = require('../../../Domains/comments/entities/AddedComment')
const CommentRepository = require('../../../Domains/comments/CommentRepository')
const ThreadRepository = require('../../../Domains/threads/ThreadRepository')
const AddCommentUseCase = require('../AddCommentUseCase')

describe('AddCommentUseCase', () => {
  /**
     * Menguji apakah use case mampu memambahkan comment langkah demi langkah dengan benar.
     */
  it('should add comment correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'sebuah comment'
    }

    const userId = 'user-123'
    const threadId = 'thread-123'

    const mockAddedComment = new AddedComment({
      id: 'comment-123',
      content: 'sebuah comment',
      owner: userId
    })

    const expectedAddedComment = new AddedComment({
      id: 'comment-123',
      content: 'sebuah comment',
      owner: userId
    })

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository()
    const mockCommentRepository = new CommentRepository()

    /** mocking needed function */
    mockThreadRepository.verifyThreadAvailability = jest.fn()
      .mockImplementation(() => Promise.resolve())
    mockCommentRepository.addComment = jest.fn()
      .mockImplementation(() => Promise.resolve(mockAddedComment))

    /** creating use case instance */
    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository
    })

    // Action
    const addedComment = await addCommentUseCase.execute(userId, threadId, useCasePayload)

    // Assert
    expect(mockThreadRepository.verifyThreadAvailability).toBeCalledWith(threadId)
    expect(mockCommentRepository.addComment).toBeCalledWith(userId, threadId, useCasePayload)
    expect(addedComment).toStrictEqual(expectedAddedComment)
  })
})
