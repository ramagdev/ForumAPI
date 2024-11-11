const DeleteCommentUseCase = require('../DeleteCommentUseCase')
const CommentRepository = require('../../../Domains/comments/CommentRepository')
const ThreadRepository = require('../../../Domains/threads/ThreadRepository')
describe('DeleteCommentUseCase interface', () => {
  it('should throw an error when the user is not the owner of the comment', async () => {
    // Arrange
    const userId = 'user-123'
    const threadId = 'thread-123'
    const commentId = 'comment-123'

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository()
    const mockCommentRepository = new CommentRepository()

    /** mocking needed function */
    mockThreadRepository.verifyThreadAvailability = jest.fn()
      .mockImplementation(() => Promise.resolve())
    mockCommentRepository.verifyCommentAvailability = jest.fn()
      .mockImplementation(() => Promise.resolve())
    mockCommentRepository.verifyCommentOwner = jest.fn()
      .mockImplementation(() => Promise.resolve('user-1234'))
    mockCommentRepository.deleteComment = jest.fn()
      .mockImplementation(() => Promise.resolve())

    /** creating use case instance */
    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository
    })

    // Action & Assert
    await expect(deleteCommentUseCase.execute(userId, threadId, commentId))
      .rejects.toThrowError('DELETE_COMMENT_USE_CASE.USER_IS_NOT_COMMENT_OWNER')

    expect(mockThreadRepository.verifyThreadAvailability).toBeCalledWith(threadId)
    expect(mockCommentRepository.verifyCommentAvailability).toBeCalledWith(commentId)
    expect(mockCommentRepository.verifyCommentOwner).toBeCalledWith(commentId)
    expect(mockCommentRepository.deleteComment).not.toBeCalled()
  })

  it('should orchestrating the delete comment action correctly', async () => {
    const userId = 'user-123'
    const threadId = 'thread-123'
    const commentId = 'comment-123'

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository()
    const mockCommentRepository = new CommentRepository()

    /** mocking needed function */
    mockThreadRepository.verifyThreadAvailability = jest.fn()
      .mockImplementation(() => Promise.resolve())
    mockCommentRepository.verifyCommentAvailability = jest.fn()
      .mockImplementation(() => Promise.resolve())
    mockCommentRepository.verifyCommentOwner = jest.fn()
      .mockImplementation(() => Promise.resolve('user-123'))
    mockCommentRepository.deleteComment = jest.fn()
      .mockImplementation(() => Promise.resolve())

    /** creating use case instance */
    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository
    })

    // Action
    await deleteCommentUseCase.execute(userId, threadId, commentId)

    // Assert
    expect(mockThreadRepository.verifyThreadAvailability).toBeCalledWith(threadId)
    expect(mockCommentRepository.verifyCommentAvailability).toBeCalledWith(commentId)
    expect(mockCommentRepository.verifyCommentOwner).toBeCalledWith(commentId)
    expect(mockCommentRepository.deleteComment).toBeCalledWith(commentId)
  })
})
