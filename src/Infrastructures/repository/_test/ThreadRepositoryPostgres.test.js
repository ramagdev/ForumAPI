const pool = require('../../database/postgres/pool')

const ThreadTableTestHelper = require('../../../../tests/ThreadsTableTestHelper')
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper')

const CreateThread = require('../../../Domains/threads/entities/CreateThread')
const AddedThread = require('../../../Domains/threads/entities/AddedThread')
const ThreadReposotoryPostgres = require('../ThreadRepositoryPostgres')
const NotFoundError = require('../../../Commons/exceptions/NotFoundError')

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadTableTestHelper.cleanTable()
    await UsersTableTestHelper.cleanTable()
  })

  afterAll(async () => {
    await pool.end()
  })

  describe('addThread function', () => {
    it('should persist create thread', async () => {
      // Arrange
      const createThread = new CreateThread({
        title: 'sebuah thread',
        body: 'sebuah body thread'
      })
      const userId = 'user-123'
      const fakeIdGenerator = () => '123'
      const threadRepositoryPostgres = new ThreadReposotoryPostgres(pool, fakeIdGenerator)

      // Action
      await UsersTableTestHelper.addUser({ id: userId })
      await threadRepositoryPostgres.addThread(userId, createThread)

      // Assert
      const threads = await ThreadTableTestHelper.findThreadById('thread-123')
      expect(threads).toHaveLength(1)
    })

    it('should return added thread correctly', async () => {
      // Arrange
      const createThread = new CreateThread({
        title: 'sebuah thread',
        body: 'sebuah body thread'
      })

      const userId = 'user-123'

      const fakeIdGenerator = () => '123'
      const threadRepositoryPostgres = new ThreadReposotoryPostgres(pool, fakeIdGenerator)

      // Action
      await UsersTableTestHelper.addUser({ id: userId })
      const addedThread = await threadRepositoryPostgres.addThread(userId, createThread)

      // Assert
      expect(addedThread).toStrictEqual(new AddedThread({
        id: 'thread-123',
        title: 'sebuah thread',
        owner: 'user-123'
      }))
    })
  })

  describe('verifyAvailableThread function', () => {
    it('should throw error when thread not found', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadReposotoryPostgres(pool, {})

      // Action & Assert
      await expect(threadRepositoryPostgres.verifyThreadAvailability('thread-123'))
        .rejects
        .toThrowError(NotFoundError)
    })

    it('should not throw error when thread found', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadReposotoryPostgres(pool, {})

      // Action
      await UsersTableTestHelper.addUser({ id: 'user-123' })
      await ThreadTableTestHelper.addThread({ id: 'thread-123' })

      // Action & Assert
      expect(threadRepositoryPostgres.verifyThreadAvailability('thread-123'))
        .resolves
        .not.toThrowError(NotFoundError)
    })
  })

  describe('getThreadById function', () => {
    it('should return thread correctly', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadReposotoryPostgres(pool, {})

      // Action
      await UsersTableTestHelper.addUser({ id: 'user-123' })
      await ThreadTableTestHelper.addThread({ id: 'thread-123', date: '2022-01-01T00:00:00.000Z' })

      // Action & Assert
      const thread = await threadRepositoryPostgres.getThreadById('thread-123')
      expect(thread).toStrictEqual({
        id: 'thread-123',
        title: 'sebuah thread',
        body: 'sebuah body thread',
        date: '2022-01-01T00:00:00.000Z',
        owner: 'user-123'
      })
    })
  })
})
