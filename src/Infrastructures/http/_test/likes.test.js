const pool = require('../../database/postgres/pool')
const container = require('../../container')
const createServer = require('../createServer')

const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper')
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper')
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper')
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper.js')
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper.js')

describe('/likes endpoint', () => {
  afterAll(async () => {
    await pool.end()
  })

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable()
    await AuthenticationsTableTestHelper.cleanTable()
    await ThreadsTableTestHelper.cleanTable()
    await CommentsTableTestHelper.cleanTable()
    await LikesTableTestHelper.cleanTable()
  })

  describe('when PUT /likes', () => {
    it('should respond with 401 when request does not contain needed authentication', async () => {
      // Arrange
      const server = await createServer(container)

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: '/threads/thread-123/comments/comment-123/likes'
      })

      // Assert
      expect(response.result.message).toEqual('Missing authentication')
      expect(response.statusCode).toEqual(401)
    })

    it('should respond with 404 when thread not found', async () => {
      // Arrange
      const server = await createServer(container)

      const mockUser = {
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia'
      }

      /** add user */
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: mockUser
      })

      // Action

      const authResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: mockUser.username,
          password: mockUser.password
        }
      })

      const { accessToken } = JSON.parse(authResponse.payload).data

      const response = await server.inject({
        method: 'PUT',
        url: '/threads/thread-123/comments/comment-123/likes',
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      // Assert
      expect(response.result.message).toEqual('thread tidak ditemukan')
      expect(response.statusCode).toEqual(404)
    })

    it('should respond with 404 when comment not found', async () => {
      // Arrange
      const server = await createServer(container)

      const mockUser = {
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia'
      }

      /** add user */
      const addUserResponse = await server.inject({
        method: 'POST',
        url: '/users',
        payload: mockUser
      })

      /** add thread */
      const addUserResponseJson = JSON.parse(addUserResponse.payload)
      const { id: userId } = addUserResponseJson.data.addedUser

      // Action
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: userId })

      const authResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: mockUser.username,
          password: mockUser.password
        }
      })

      const { accessToken } = JSON.parse(authResponse.payload).data

      const response = await server.inject({
        method: 'PUT',
        url: '/threads/thread-123/comments/comment-123/likes',
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      // Assert
      expect(response.result.message).toEqual('komentar tidak ditemukan')
      expect(response.statusCode).toEqual(404)
    })

    it('should respond with 200 and like comment if user do not like comment yet', async () => {
      // Arrange
      const server = await createServer(container)

      const mockUser = {
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia'
      }

      /** add user */
      const addUserResponse = await server.inject({
        method: 'POST',
        url: '/users',
        payload: mockUser
      })

      const addUserResponseJson = JSON.parse(addUserResponse.payload)
      const { id: userId } = addUserResponseJson.data.addedUser

      // Action
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: userId })
      await CommentsTableTestHelper.addComment({ id: 'comment-123', owner: userId, threadId: 'thread-123' })

      const authResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: mockUser.username,
          password: mockUser.password
        }
      })

      const { accessToken } = JSON.parse(authResponse.payload).data

      const response = await server.inject({
        method: 'PUT',
        url: '/threads/thread-123/comments/comment-123/likes',
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(200)
      expect(responseJson.status).toEqual('success')

      const likeCount = await LikesTableTestHelper.getLikeCount('comment-123')
      expect(likeCount).toEqual(1)
    })

    it('should respond with 200 and unlike comment if user already like comment', async () => {
      // Arrange
      const server = await createServer(container)

      const mockUser = {
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia'
      }

      /** add user */
      const addUserResponse = await server.inject({
        method: 'POST',
        url: '/users',
        payload: mockUser
      })

      const addUserResponseJson = JSON.parse(addUserResponse.payload)
      const { id: userId } = addUserResponseJson.data.addedUser

      // Action
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: userId })
      await CommentsTableTestHelper.addComment({ id: 'comment-123', owner: userId, threadId: 'thread-123' })
      await LikesTableTestHelper.addLike({ id: 'like-123', commentId: 'comment-123', userId })

      const authResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: mockUser.username,
          password: mockUser.password
        }
      })

      const { accessToken } = JSON.parse(authResponse.payload).data

      const response = await server.inject({
        method: 'PUT',
        url: '/threads/thread-123/comments/comment-123/likes',
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(200)
      expect(responseJson.status).toEqual('success')

      const likeCount = await LikesTableTestHelper.getLikeCount('comment-123')
      expect(likeCount).toEqual(0)
    })
  })
})
