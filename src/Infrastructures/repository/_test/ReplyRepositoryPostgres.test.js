const pool = require('../../database/postgres/pool')

const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper')
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper')
const ThreadTableTestHelper = require('../../../../tests/ThreadsTableTestHelper')
const CommentTableTestHelper = require('../../../../tests/CommentsTableTestHelper.js')
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper.js')

const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres')
const CreateReply = require('../../../Domains/replies/entities/CreateReply')
const AddedReply = require('../../../Domains/replies/entities/AddedReply')
const NotFoundError = require('../../../Commons/exceptions/NotFoundError.js')

describe('ReplyRepositoryPostgres', () => {
  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable()
    await CommentTableTestHelper.cleanTable()
    await ThreadTableTestHelper.cleanTable()
    await AuthenticationsTableTestHelper.cleanTable()
    await UsersTableTestHelper.cleanTable()
  })

  afterAll(async () => {
    await pool.end()
  })

  describe('addReply function', () => {
    it('should persist create reply', async () => {
      // Arrange
      const createReply = new CreateReply({
        content: 'sebuah balasan'
      })

      const userId = 'user-123'
      const threadId = 'thread-123'
      const commentId = 'comment-123'

      const fakeIdGenerator = () => '123'

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator)

      // Action
      await UsersTableTestHelper.addUser({ id: userId })
      await ThreadTableTestHelper.addThread({ id: threadId, owner: userId })
      await CommentTableTestHelper.addComment({ id: commentId, owner: userId, threadId })
      await replyRepositoryPostgres.addReply(userId, threadId, commentId, createReply)

      // Assert
      const replies = await RepliesTableTestHelper.findReplyById('reply-123')
      expect(replies).toHaveLength(1)
    })

    it('should return added reply correctly', async () => {
      // Arrange
      const createReply = new CreateReply({
        content: 'sebuah balasan'
      })

      const userId = 'user-123'
      const threadId = 'thread-123'
      const commentId = 'comment-123'

      const fakeIdGenerator = () => '123'

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator)

      // Action
      await UsersTableTestHelper.addUser({ id: userId })
      await ThreadTableTestHelper.addThread({ id: threadId, owner: userId })
      await CommentTableTestHelper.addComment({ id: commentId, owner: userId, threadId })
      const addedReply = await replyRepositoryPostgres.addReply(userId, threadId, commentId, createReply)

      // Assert
      expect(addedReply).toStrictEqual(new AddedReply({
        id: 'reply-123',
        content: 'sebuah balasan',
        owner: userId
      }))
    })
  })

  describe('verifyReplyAvailability function', () => {
    it('should throw error when reply not found', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {})

      // Action and Assert
      await expect(replyRepositoryPostgres.verifyReplyAvailability('reply-123')).rejects.toThrowError(NotFoundError)
    })

    it('should not throw error when reply found', async () => {
      // Arrange
      const userId = 'user-123'
      const threadId = 'thread-123'
      const commentId = 'comment-123'
      const replyId = 'reply-123'

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {})

      await UsersTableTestHelper.addUser({ id: userId })
      await ThreadTableTestHelper.addThread({ id: threadId, owner: userId })
      await CommentTableTestHelper.addComment({ id: commentId, owner: userId, threadId })
      await RepliesTableTestHelper.addReply({ id: replyId, content: 'sebuah balasan', owner: userId, commentId, threadId })

      // Action and Assert
      await expect(replyRepositoryPostgres.verifyReplyAvailability('reply-123')).resolves.not.toThrowError(NotFoundError)
    })
  })

  describe('verifyReplyOwner function', () => {
    it('should return owner when reply found', async () => {
      // Arrange
      const userId = 'user-123'
      const threadId = 'thread-123'
      const commentId = 'comment-123'
      const replyId = 'reply-123'

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {})

      await UsersTableTestHelper.addUser({ id: userId })
      await ThreadTableTestHelper.addThread({ id: threadId, owner: userId })
      await CommentTableTestHelper.addComment({ id: commentId, owner: userId, threadId })
      await RepliesTableTestHelper.addReply({ id: replyId, content: 'sebuah balasan', owner: userId, commentId, threadId })

      // Action and Assert
      await expect(replyRepositoryPostgres.verifyReplyOwner(replyId))
        .resolves.toEqual(userId)
    })
  })

  describe('deleteReply function', () => {
    it('should delete reply correctly', async () => {
      // Arrange
      const userId = 'user-123'
      const threadId = 'thread-123'
      const commentId = 'comment-123'
      const replyId = 'reply-123'

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {})

      await UsersTableTestHelper.addUser({ id: userId })
      await ThreadTableTestHelper.addThread({ id: threadId, owner: userId })
      await CommentTableTestHelper.addComment({ id: commentId, owner: userId, threadId })
      await RepliesTableTestHelper.addReply({ id: replyId, content: 'sebuah balasan', owner: userId, commentId, threadId })

      // Action
      await replyRepositoryPostgres.deleteReply(replyId)

      // Assert
      const [isReplyDeleted] = await RepliesTableTestHelper.checkIfReplyIsDeleted(replyId)
      expect(isReplyDeleted).toBe(true)
    })
  })

  describe('getThreadReplies function', () => {
    it('should return replies correctly', async () => {
      // Arrange
      const userId = 'user-123'
      const threadId = 'thread-123'
      const commentId = 'comment-123'

      const firstReply = {
        id: 'reply-123',
        content: 'sebuah balasan',
        date: '2022-01-01T00:00:00.000Z',
        owner: userId,
        threadId,
        commentId
      }

      const secondReply = {
        id: 'reply-456',
        content: 'sebuah balasan juga',
        date: '2022-01-01T00:00:00.000Z',
        owner: userId,
        threadId,
        commentId
      }

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {})

      await UsersTableTestHelper.addUser({ id: userId })
      await ThreadTableTestHelper.addThread({ id: threadId, owner: userId })
      await CommentTableTestHelper.addComment({ id: commentId, owner: userId, threadId })
      await RepliesTableTestHelper.addReply(firstReply)
      await RepliesTableTestHelper.addReply(secondReply)

      await RepliesTableTestHelper.deleteReply(secondReply.id)

      // Action
      const replies = await replyRepositoryPostgres.getThreadReplies(threadId)

      // Assert
      expect(replies).toHaveLength(2)
      expect(replies).toEqual([
        {
          id: 'reply-123',
          content: 'sebuah balasan',
          date: '2022-01-01T00:00:00.000Z',
          owner: userId,
          comment_id: commentId,
          is_deleted: false
        },
        {
          id: 'reply-456',
          content: 'sebuah balasan juga',
          date: '2022-01-01T00:00:00.000Z',
          owner: userId,
          comment_id: commentId,
          is_deleted: true
        }
      ])
    })
  })
})
