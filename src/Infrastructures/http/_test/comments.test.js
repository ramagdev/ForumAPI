const pool = require('../../database/postgres/pool')
const container = require('../../container')
const createServer = require('../createServer')
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper')
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper')
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper')
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper.js')

describe('/comments endpoint', () => {
  afterAll(async () => {
    await pool.end()
  })

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable()
    await AuthenticationsTableTestHelper.cleanTable()
    await ThreadsTableTestHelper.cleanTable()
    await CommentsTableTestHelper.cleanTable()
  })

  describe('when POST /comments', () => {
    it('should respond with 401 when request does not contain needed authentication', async () => {
      // Arrange
      const server = await createServer(container)
      const requestPayload = {
        content: 'sebuah comment'
      }

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: requestPayload
      })

      // Assert
      expect(response.result.message).toEqual('Missing authentication')
      expect(response.statusCode).toEqual(401)
    })

    it('should respond with 404 when thread not found', async () => {
      // Arrange
      const server = await createServer(container)
      const requestPayload = {
        content: 'sebuah comment'
      }

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
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      // Assert
      expect(response.result.message).toEqual('thread tidak ditemukan')
      expect(response.statusCode).toEqual(404)
    })

    it('should respond with 400 when request payload not meet data type specification', async () => {
      // Arrange
      const server = await createServer(container)
      const requestPayload = {
        content: 123
      }

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
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      // Assert
      expect(response.result.message).toEqual('content harus berupa string')
      expect(response.statusCode).toEqual(400)
    })

    it('should respond with 201 and persisted comment', async () => {
      // Arrange
      const server = await createServer(container)
      const requestPayload = {
        content: 'sebuah comment'
      }

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
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(201)
      expect(responseJson.status).toEqual('success')
      expect(responseJson.data.addedComment).toBeDefined()
      expect(responseJson.data.addedComment.content).toEqual(requestPayload.content)
      expect(responseJson.data.addedComment.owner).toEqual(userId)
      expect(CommentsTableTestHelper.findCommentById(responseJson.data.addedComment.id)).toBeTruthy()
    })
  })

  describe('when DELETE /comments/{commentId}', () => {
    it('should respond with 401 when request does not contain needed authentication', async () => {
      // Arrange
      const server = await createServer(container)

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123'
      })

      // Assert
      expect(response.result.message).toEqual('Missing authentication')
      expect(response.statusCode).toEqual(401)
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
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123',
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      // Assert
      expect(response.result.message).toEqual('komentar tidak ditemukan')
      expect(response.statusCode).toEqual(404)
    })

    it('should respond with 403 when user not comment owner', async () => {
      // Arrange
      const server = await createServer(container)

      const mockUser = {
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia'
      }

      const mockUser2 = {
        username: 'dicoding2',
        password: 'secret2',
        fullname: 'Dicoding Indonesia 2'
      }

      /** add user */
      const addUserResponse = await server.inject({
        method: 'POST',
        url: '/users',
        payload: mockUser
      })

      const addUserResponseJson = JSON.parse(addUserResponse.payload)
      const { id: userId } = addUserResponseJson.data.addedUser

      const addSecondUserResponse = await server.inject({
        method: 'POST',
        url: '/users',
        payload: mockUser2
      })

      const addSecondUserResponseJson = JSON.parse(addSecondUserResponse.payload)
      const { id: secondUserId } = addSecondUserResponseJson.data.addedUser

      // Action
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: userId })
      await CommentsTableTestHelper.addComment({ id: 'comment-123', owner: secondUserId })

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
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123',
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      // Assert
      expect(response.result.message).toEqual('anda tidak berhak menghapus komentar ini')
      expect(response.statusCode).toEqual(403)
    })

    it('should respond with 200 and success status when delete comment', async () => {
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
      await CommentsTableTestHelper.addComment({ id: 'comment-123', owner: userId })

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
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123',
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      // Assert
      expect(response.result).toEqual({
        status: 'success'
      })
      expect(response.statusCode).toEqual(200)
      const helperResponse = await CommentsTableTestHelper.findCommentById('comment-123')
      expect(helperResponse[0].is_deleted).toBeTruthy()
    })
  })
})
