const AddReplyUseCase = require('../AddReplyUseCase')
const ReplyRepository = require('../../../Domains/replies/ReplyRepository')
const CommentRepository = require('../../../Domains/comments/CommentRepository')
const ThreadRepository = require('../../../Domains/threads/ThreadRepository')
const AddedReply = require('../../../Domains/replies/entities/AddedReply')

describe('AddReplyUseCase', () => {
  it('should orchestrating the add reply action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'sebuah balasan'
    }

    const userId = 'user-123'
    const threadId = 'thread-123'
    const commentId = 'comment-123'

    const mockAddedReply = new AddedReply({
      id: 'reply-123',
      content: 'sebuah balasan',
      owner: userId
    })

    const expectedAddedReply = new AddedReply({
      id: 'reply-123',
      content: 'sebuah balasan',
      owner: userId
    })

    /** creating dependency of use case */
    const mockReplyRepository = new ReplyRepository()
    const mockCommentRepository = new CommentRepository()
    const mockThreadRepository = new ThreadRepository()

    /** mocking needed function */
    mockReplyRepository.addReply = jest.fn()
      .mockImplementation(() => Promise.resolve(mockAddedReply))
    mockCommentRepository.verifyCommentAvailability = jest.fn()
      .mockImplementation(() => Promise.resolve())
    mockThreadRepository.verifyThreadAvailability = jest.fn()
      .mockImplementation(() => Promise.resolve())

    /** creating use case instance */
    const addReplyUseCase = new AddReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository
    })

    // Action
    const addedReply = await addReplyUseCase.execute(userId, threadId, commentId, useCasePayload)

    // Assert
    expect(mockThreadRepository.verifyThreadAvailability).toBeCalledWith(threadId)
    expect(mockCommentRepository.verifyCommentAvailability).toBeCalledWith(commentId)
    expect(mockReplyRepository.addReply).toBeCalledWith(userId, threadId, commentId, useCasePayload)
    expect(addedReply).toStrictEqual(expectedAddedReply)
  })
})
