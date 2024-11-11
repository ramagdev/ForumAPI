const DeleteReplyUseCase = require('../DeleteReplyUseCase')
const ReplyRepository = require('../../../Domains/replies/ReplyRepository')
const CommentRepository = require('../../../Domains/comments/CommentRepository')
const ThreadRepository = require('../../../Domains/threads/ThreadRepository')

describe('DeleteReplyUseCase', () => {
  it('should throw an error when the user is not the owner of the comment', async () => {
    // Arrange
    const useCasePayload = {
      userId: 'user-123',
      threadId: 'thread-123',
      commentId: 'comment-123',
      replyId: 'reply-123'
    }

    const mockThreadRepository = new ThreadRepository()
    const mockCommentRepository = new CommentRepository()
    const mockReplyRepository = new ReplyRepository()

    /* mocking needed function */
    mockThreadRepository.verifyThreadAvailability = jest.fn()
      .mockImplementation(() => Promise.resolve())
    mockCommentRepository.verifyCommentAvailability = jest.fn()
      .mockImplementation(() => Promise.resolve())
    mockReplyRepository.verifyReplyAvailability = jest.fn()
      .mockImplementation(() => Promise.resolve())
    mockReplyRepository.verifyReplyOwner = jest.fn()
      .mockImplementation(() => Promise.resolve('user-1234'))
    mockReplyRepository.deleteReply = jest.fn()
      .mockImplementation(() => Promise.resolve())

    /* creating use case instance */
    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository
    })

    // Action & Assert
    await expect(deleteReplyUseCase.execute(
      useCasePayload.userId,
      useCasePayload.threadId,
      useCasePayload.commentId,
      useCasePayload.replyId
    )).rejects.toThrowError('DELETE_REPLY_USE_CASE.USER_IS_NOT_REPLY_OWNER')

    expect(mockThreadRepository.verifyThreadAvailability).toBeCalledWith(useCasePayload.threadId)
    expect(mockCommentRepository.verifyCommentAvailability).toBeCalledWith(useCasePayload.commentId)
    expect(mockReplyRepository.verifyReplyAvailability).toBeCalledWith(useCasePayload.replyId)
    expect(mockReplyRepository.verifyReplyOwner).toBeCalledWith(useCasePayload.replyId)
    expect(mockReplyRepository.deleteReply).not.toBeCalledWith(useCasePayload.replyId)
  })

  it('should orchestrating the delete reply action correctly', async () => {
    // Arrange
    const useCasePayload = {
      userId: 'user-123',
      threadId: 'thread-123',
      commentId: 'comment-123',
      replyId: 'reply-123'
    }

    const mockThreadRepository = new ThreadRepository()
    const mockCommentRepository = new CommentRepository()
    const mockReplyRepository = new ReplyRepository()

    /* mocking needed function */
    mockThreadRepository.verifyThreadAvailability = jest.fn()
      .mockImplementation(() => Promise.resolve())
    mockCommentRepository.verifyCommentAvailability = jest.fn()
      .mockImplementation(() => Promise.resolve())
    mockReplyRepository.verifyReplyAvailability = jest.fn()
      .mockImplementation(() => Promise.resolve())
    mockReplyRepository.verifyReplyOwner = jest.fn()
      .mockImplementation(() => {
        return Promise.resolve(useCasePayload.userId)
      })
    mockReplyRepository.deleteReply = jest.fn()
      .mockImplementation(() => Promise.resolve())

    /* creating use case instance */
    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository
    })

    // Action
    await deleteReplyUseCase.execute(
      useCasePayload.userId,
      useCasePayload.threadId,
      useCasePayload.commentId,
      useCasePayload.replyId
    )

    // Assert
    expect(mockThreadRepository.verifyThreadAvailability).toBeCalledWith(useCasePayload.threadId)
    expect(mockCommentRepository.verifyCommentAvailability).toBeCalledWith(useCasePayload.commentId)
    expect(mockReplyRepository.verifyReplyAvailability).toBeCalledWith(useCasePayload.replyId)
    expect(mockReplyRepository.verifyReplyOwner).toBeCalledWith(useCasePayload.replyId)
    expect(mockReplyRepository.deleteReply).toBeCalledWith(useCasePayload.replyId)
  })
})
