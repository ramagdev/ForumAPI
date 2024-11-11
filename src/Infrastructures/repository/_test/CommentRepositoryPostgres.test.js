const pool = require('../../database/postgres/pool')

const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper')
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper')
const ThreadTableTestHelper = require('../../../../tests/ThreadsTableTestHelper')
const CommentTableTestHelper = require('../../../../tests/CommentsTableTestHelper.js')

const CreateComment = require('../../../Domains/comments/entities/CreateComment')
const AddedComment = require('../../../Domains/comments/entities/AddedComment')
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres')

const NotFoundError = require('../../../Commons/exceptions/NotFoundError')

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable()
    await AuthenticationsTableTestHelper.cleanTable()
    await ThreadTableTestHelper.cleanTable()
    await CommentTableTestHelper.cleanTable()
  })

  afterAll(async () => {
    await pool.end()
  })

  describe('addComment function', () => {
    it('should persist create comment', async () => {
      // Arrange
      const createComment = new CreateComment({
        content: 'sebuah comment'
      })
      const userId = 'user-123'
      const threadId = 'thread-123'
      const fakeIdGenerator = () => '123'
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator)

      // Action
      await UsersTableTestHelper.addUser({ id: userId })
      await ThreadTableTestHelper.addThread({ id: threadId, owner: userId })
      await commentRepositoryPostgres.addComment(userId, threadId, createComment)

      // Assert
      const comments = await CommentTableTestHelper.findCommentById('comment-123')
      expect(comments).toHaveLength(1)
    })

    it('should return added comment correctly', async () => {
      // Arrange
      const createComment = new CreateComment({
        content: 'sebuah comment'
      })
      const userId = 'user-123'
      const threadId = 'thread-123'
      const fakeIdGenerator = () => '123'
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator)

      // Action
      await UsersTableTestHelper.addUser({ id: userId })
      await ThreadTableTestHelper.addThread({ id: threadId, owner: userId })
      const addedComment = await commentRepositoryPostgres.addComment(userId, threadId, createComment)

      // Assert
      expect(addedComment).toStrictEqual(new AddedComment({
        id: 'comment-123',
        content: createComment.content,
        owner: userId
      }))
    })
  })

  describe('verifyCommentAvailability function', () => {
    it('should throw error when comment not found', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {})

      // Action and Assert
      await expect(commentRepositoryPostgres.verifyCommentAvailability('comment-123'))
        .rejects.toThrowError(NotFoundError)
    })

    it('should not throw error when comment found', async () => {
      // Arrange
      const userId = 'user-123'
      const threadId = 'thread-123'
      const commentId = 'comment-123'

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {})

      await UsersTableTestHelper.addUser({ id: userId })
      await ThreadTableTestHelper.addThread({ id: threadId, owner: userId })
      await CommentTableTestHelper.addComment({ id: commentId, threadId, owner: userId })

      // Action and Assert
      await expect(commentRepositoryPostgres.verifyCommentAvailability(commentId))
        .resolves.not.toThrowError(NotFoundError)
    })
  })

  describe('verifyCommentOwner function', () => {
    it('should return owner', async () => {
      // Arrange
      const userId = 'user-123'
      const threadId = 'thread-123'
      const commentId = 'comment-123'

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {})

      await UsersTableTestHelper.addUser({ id: userId })
      await ThreadTableTestHelper.addThread({ id: threadId, owner: userId })
      await CommentTableTestHelper.addComment({ id: commentId, threadId, owner: userId })

      // Action and Assert
      await expect(commentRepositoryPostgres.verifyCommentOwner(commentId))
        .resolves.toEqual(userId)
    })
  })

  describe('deleteComment function', () => {
    it('should delete comment correctly', async () => {
      // Arrange
      const userId = 'user-123'
      const threadId = 'thread-123'
      const commentId = 'comment-123'

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {})

      await UsersTableTestHelper.addUser({ id: userId })
      await ThreadTableTestHelper.addThread({ id: threadId, owner: userId })
      await CommentTableTestHelper.addComment({ id: commentId, threadId, owner: userId })

      // Action
      await commentRepositoryPostgres.deleteComment(commentId)

      // Assert

      const [isCommentDeleted] = await CommentTableTestHelper.checkIfCommentDeleted(commentId)
      expect(isCommentDeleted).toBe(true)
    })
  })

  describe('getThreadComments function', () => {
    it('should return thread comments correctly', async () => {
      // Arrange
      const userId = 'user-123'
      const threadId = 'thread-123'

      const firstComment = {
        id: 'comment-123',
        content: 'sebuah comment',
        date: '2022-01-01T00:00:00.000Z',
        owner: userId,
        threadId
      }

      const secondComment = {
        id: 'comment-456',
        content: 'sebuah comment juga',
        date: '2022-01-01T00:00:00.000Z',
        owner: userId,
        threadId
      }

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {})

      await UsersTableTestHelper.addUser({ id: userId })
      await ThreadTableTestHelper.addThread({ id: threadId, owner: userId })
      await CommentTableTestHelper.addComment(firstComment)
      await CommentTableTestHelper.addComment(secondComment)

      await commentRepositoryPostgres.deleteComment(secondComment.id)

      // Action
      const comments = await commentRepositoryPostgres.getThreadComments(threadId)

      // Assert
      expect(comments).toHaveLength(2)
      expect(comments).toEqual([
        {
          id: 'comment-123',
          content: 'sebuah comment',
          date: '2022-01-01T00:00:00.000Z',
          owner: userId,
          is_deleted: false
        },
        {
          id: 'comment-456',
          content: 'sebuah comment juga',
          date: '2022-01-01T00:00:00.000Z',
          owner: userId,
          is_deleted: true
        }
      ])
    })
  })
})
