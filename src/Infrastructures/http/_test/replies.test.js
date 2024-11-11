const pool = require('../../database/postgres/pool')
const container = require('../../container')
const createServer = require('../createServer')
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper')
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper')
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper')
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper.js')
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper.js')

describe('/replies endpoint', () => {
  afterAll(async () => {
    await pool.end()
  })

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable()
    await AuthenticationsTableTestHelper.cleanTable()
    await ThreadsTableTestHelper.cleanTable()
    await CommentsTableTestHelper.cleanTable()
    await RepliesTableTestHelper.cleanTable()
  })

  describe('POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should response 401 when request not contain access token', async () => {
      // Arrange
      const server = await createServer(container)
      const requestPayload = {
        content: 'sebuah balasan'
      }

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments/comment-123/replies',
        payload: requestPayload
      })

      // Assert
      expect(response.result.message).toEqual('Missing authentication')
      expect(response.statusCode).toEqual(401)
    })

    it('should response 404 when thread not found', async () => {
      // Arrange
      const server = await createServer(container)
      const requestPayload = {
        content: 'sebuah balasan'
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
        url: '/threads/thread-123/comments/comment-123/replies',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      // Assert
      expect(response.result.message).toEqual('thread tidak ditemukan')
      expect(response.statusCode).toEqual(404)
    })

    it('should response 404 when comment not found', async () => {
      // Arrange
      const server = await createServer(container)
      const requestPayload = {
        content: 'sebuah balasan'
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
        url: '/threads/thread-123/comments/comment-123/replies',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      // Assert
      expect(response.result.message).toEqual('komentar tidak ditemukan')
      expect(response.statusCode).toEqual(404)
    })

    it('should response 201 and persisted reply', async () => {
      // Arrange
      const server = await createServer(container)
      const requestPayload = {
        content: 'sebuah balasan'
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
        method: 'POST',
        url: '/threads/thread-123/comments/comment-123/replies',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(201)
      expect(responseJson.data.addedReply).toBeDefined()
      expect(responseJson.data.addedReply.content).toEqual(requestPayload.content)
      expect(responseJson.data.addedReply.owner).toEqual(userId)
      expect(RepliesTableTestHelper.findReplyById(responseJson.data.addedReply.id)).toBeTruthy()
    })
  })

  describe('when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    it('should response 401 when request not contain access token', async () => {
      // Arrange
      const server = await createServer(container)

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123/replies/reply-123'
      })

      // Assert
      expect(response.result.message).toEqual('Missing authentication')
      expect(response.statusCode).toEqual(401)
    })

    it('should response 404 when reply not found', async () => {
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
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123/replies/reply-123',
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      // Assert
      expect(response.result.message).toEqual('balasan tidak ditemukan')
      expect(response.statusCode).toEqual(404)
    })

    it('should response 403 when user not reply owner', async () => {
      // Arrange
      const server = await createServer(container)

      const mockUser = {
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia'
      }

      const mockUser2 = {
        username: 'dicoding2',
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

      const addSecondUserResponse = await server.inject({
        method: 'POST',
        url: '/users',
        payload: mockUser2
      })

      const addSecondUserResponseJson = JSON.parse(addSecondUserResponse.payload)
      const { id: userId2 } = addSecondUserResponseJson.data.addedUser

      // Action
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: userId })
      await CommentsTableTestHelper.addComment({ id: 'comment-123', owner: userId, threadId: 'thread-123' })
      await RepliesTableTestHelper.addReply({ id: 'reply-123', owner: userId2, commentId: 'comment-123' })

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
        url: '/threads/thread-123/comments/comment-123/replies/reply-123',
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      // Assert
      expect(response.result.message).toEqual('anda tidak berhak menghapus balasan ini')
      expect(response.statusCode).toEqual(403)
    })

    it('should response 200 when delete reply success', async () => {
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
      await RepliesTableTestHelper.addReply({ id: 'reply-123', owner: userId, commentId: 'comment-123' })

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
        url: '/threads/thread-123/comments/comment-123/replies/reply-123',
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      // Assert
      expect(response.result).toEqual({
        status: 'success'
      })
      expect(response.statusCode).toEqual(200)
      const helperResponse = await RepliesTableTestHelper.findReplyById('reply-123')
      expect(helperResponse[0].is_deleted).toBeTruthy()
    })
  })
})
