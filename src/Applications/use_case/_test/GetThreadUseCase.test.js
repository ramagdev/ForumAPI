const GetThreadUseCase = require('../GetThreadUseCase')
const ThreadRepository = require('../../../Domains/threads/ThreadRepository')
const CommentRepository = require('../../../Domains/comments/CommentRepository')
const ReplyRepository = require('../../../Domains/replies/ReplyRepository')
const UserRepository = require('../../../Domains/users/UserRepository')

describe('GetThreadUseCase', () => {
  it('should orchestrating the get thread action correctly', async () => {
    // Arrange
    const mockThread = {
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body',
      date: '2020-01-01T00:00:00.000Z',
      owner: 'user-123'
    }

    const mockThreadUsername = 'dicoding'

    const mockThreadComments = [
      {
        id: 'comment-123',
        content: 'sebuah comment',
        date: '2020-01-01T00:00:00.000Z',
        owner: 'user-1234',
        is_deleted: false
      },
      {
        id: 'comment-456',
        content: 'sebuah komentar juga',
        date: '2020-01-01T00:00:00.000Z',
        owner: 'user-12345',
        is_deleted: true
      }
    ]

    const mockCommentUsername = 'awsdicoding'

    const mockThreadReplies = [
      {
        id: 'reply-123',
        content: 'sebuah reply',
        date: '2020-01-01T00:00:00.000Z',
        owner: 'user-12345',
        comment_id: 'comment-123',
        is_deleted: false
      },
      {
        id: 'reply-456',
        content: 'sebuah balasan juga',
        date: '2020-01-01T00:00:00.000Z',
        owner: 'user-123456',
        comment_id: 'comment-123',
        is_deleted: true
      }
    ]

    const mockReplyUsername = 'awsdicodingindonesia'
    const mockDeletedReplyUsername = 'dicodingindonesia'

    const mockThreadRepository = new ThreadRepository()
    const mockCommentRepository = new CommentRepository()
    const mockReplyRepository = new ReplyRepository()
    const mockUserRepository = new UserRepository()

    /** mocking needed function */
    mockThreadRepository.verifyThreadAvailability = jest.fn()
      .mockImplementation(() => Promise.resolve())
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(mockThread))
    mockCommentRepository.getThreadComments = jest.fn()
      .mockImplementation(() => Promise.resolve(mockThreadComments))
    mockReplyRepository.getThreadReplies = jest.fn()
      .mockImplementation(() => Promise.resolve(mockThreadReplies))
    mockUserRepository.getUsernameById = jest.fn(
      (userId) => {
        if (userId === 'user-123') {
          return Promise.resolve(mockThreadUsername)
        }
        if (userId === 'user-1234') {
          return Promise.resolve(mockCommentUsername)
        }
        if (userId === 'user-12345') {
          return Promise.resolve(mockReplyUsername)
        }
        if (userId === 'user-123456') {
          return Promise.resolve(mockDeletedReplyUsername)
        }
      }
    )

    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
      userRepository: mockUserRepository
    })

    // Action
    const threadDetail = await getThreadUseCase.execute(mockThread.id)

    // Assert
    expect(mockThreadRepository.verifyThreadAvailability).toBeCalledWith(mockThread.id)
    expect(mockThreadRepository.getThreadById).toBeCalledWith(mockThread.id)
    expect(mockCommentRepository.getThreadComments).toBeCalledWith(mockThread.id)
    expect(mockReplyRepository.getThreadReplies).toBeCalledWith(mockThread.id)
    expect(mockUserRepository.getUsernameById).toBeCalledWith(mockThread.owner)
    expect(mockUserRepository.getUsernameById).toBeCalledWith(mockThreadComments[0].owner)
    expect(mockUserRepository.getUsernameById).toBeCalledWith(mockThreadComments[1].owner)
    expect(mockUserRepository.getUsernameById).toBeCalledWith(mockThreadReplies[0].owner)
    expect(mockUserRepository.getUsernameById).toBeCalledWith(mockThreadReplies[1].owner)

    expect(threadDetail.thread.comments[1].content).toStrictEqual('**komentar telah dihapus**')

    expect(threadDetail.thread.comments[0].replies[1].content).toStrictEqual('**balasan telah dihapus**')

    expect(threadDetail).toStrictEqual(
      {
        thread: {
          id: 'thread-123',
          title: 'sebuah thread',
          body: 'sebuah body',
          date: '2020-01-01T00:00:00.000Z',
          username: 'dicoding',
          comments: [
            {
              id: 'comment-123',
              username: 'awsdicoding',
              date: '2020-01-01T00:00:00.000Z',
              replies: [
                {
                  id: 'reply-123',
                  content: 'sebuah reply',
                  date: '2020-01-01T00:00:00.000Z',
                  username: 'awsdicodingindonesia'
                },
                {
                  id: 'reply-456',
                  content: '**balasan telah dihapus**',
                  date: '2020-01-01T00:00:00.000Z',
                  username: 'dicodingindonesia'
                }
              ],
              content: 'sebuah comment'
            },
            {
              id: 'comment-456',
              username: 'awsdicodingindonesia',
              date: '2020-01-01T00:00:00.000Z',
              replies: [

              ],
              content: '**komentar telah dihapus**'
            }
          ]
        }
      })
  })
})
