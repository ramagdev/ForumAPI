const pool = require('../../database/postgres/pool')

const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper')
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper')
const ThreadTableTestHelper = require('../../../../tests/ThreadsTableTestHelper')
const CommentTableTestHelper = require('../../../../tests/CommentsTableTestHelper.js')
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper.js')

const LikeRepositoryPostgres = require('../LikeRepositoryPostgres.js')

describe('LikeRepositoryPostgres', () => {
  afterEach(async () => {
    await LikesTableTestHelper.cleanTable()
    await CommentTableTestHelper.cleanTable()
    await ThreadTableTestHelper.cleanTable()
    await AuthenticationsTableTestHelper.cleanTable()
    await UsersTableTestHelper.cleanTable()
  })

  afterAll(async () => {
    await pool.end()
  })

  describe('updateLike', () => {
    it('should add like count for comment if user not like yet', async () => {
      // Arrange
      const fakeIdGenerator = () => '123'
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator)

      // Action
      await UsersTableTestHelper.addUser({ id: 'user-123' })
      await ThreadTableTestHelper.addThread({ id: 'thread-123' })
      await CommentTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' })
      await likeRepositoryPostgres.updateLike('comment-123', 'user-123')

      // Assert
      const likeCount = await LikesTableTestHelper.getLikeCount('comment-123')
      expect(likeCount).toEqual(1)
    })

    it('should reduce like count for comment if user already like', async () => {
      // Arrange
      const fakeIdGenerator = () => '123'
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator)

      // Action
      await UsersTableTestHelper.addUser({ id: 'user-123' })
      await ThreadTableTestHelper.addThread({ id: 'thread-123' })
      await CommentTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' })
      await likeRepositoryPostgres.updateLike('comment-123', 'user-123')
      await likeRepositoryPostgres.updateLike('comment-123', 'user-123')

      // Assert
      const likeCount = await LikesTableTestHelper.getLikeCount('comment-123')
      expect(likeCount).toEqual(0)
    })
  })

  describe('getLikeCount', () => {
    it('should return like count for comment', async () => {
      // Arrange
      const fakeIdGenerator = jest.fn()
        .mockImplementationOnce(() => '123')
        .mockImplementationOnce(() => '456')
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator)

      // Action
      await UsersTableTestHelper.addUser({ id: 'user-123' })
      await ThreadTableTestHelper.addThread({ id: 'thread-123' })
      await CommentTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' })
      await likeRepositoryPostgres.updateLike('comment-123', 'user-123')

      await UsersTableTestHelper.addUser({ id: 'user-456', username: 'user456' })
      await likeRepositoryPostgres.updateLike('comment-123', 'user-456')

      // Assert
      const likeCount = await likeRepositoryPostgres.getLikeCount('comment-123')
      expect(likeCount).toEqual(2)
    })
  })
})
