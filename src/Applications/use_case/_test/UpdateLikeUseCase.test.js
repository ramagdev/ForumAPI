const UpdateLikeUseCase = require('../UpdateLikeUseCase')
const LikeRepository = require('../../../Domains/likes/LikeRepository')
const CommentRepository = require('../../../Domains/comments/CommentRepository')
const ThreadRepository = require('../../../Domains/threads/ThreadRepository')

describe('UpdateLikeUseCase', () => {
  it('should orchestrating the add like action correctly', async () => {
    // Arrange
    const credentialId = 'user-123'
    const threadId = 'thread-123'
    const commentId = 'comment-123'

    const mockLikeRepository = new LikeRepository()
    const mockCommentRepository = new CommentRepository()
    const mockThreadRepository = new ThreadRepository()

    /* mocking needed function */
    mockThreadRepository.verifyThreadAvailability = jest.fn()
      .mockImplementation(() => Promise.resolve())
    mockCommentRepository.verifyCommentAvailability = jest.fn()
      .mockImplementation(() => Promise.resolve())
    mockLikeRepository.updateLike = jest.fn()
      .mockImplementation(() => Promise.resolve())

    const updateLikeUseCase = new UpdateLikeUseCase({
      likeRepository: mockLikeRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository
    })

    // Action
    await updateLikeUseCase.execute(credentialId, threadId, commentId)

    // Assert
    expect(mockThreadRepository.verifyThreadAvailability).toBeCalledWith(threadId)
    expect(mockCommentRepository.verifyCommentAvailability).toBeCalledWith(commentId)
    expect(mockLikeRepository.updateLike).toBeCalledWith(commentId, credentialId)
  })
})
