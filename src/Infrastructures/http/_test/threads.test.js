const pool = require('../../database/postgres/pool')
const container = require('../../container')
const createServer = require('../createServer')
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper')
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper')
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper')
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper.js')
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper.js')

describe('/threads endpoint', () => {
  afterAll(async () => {
    await pool.end()
  })

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable()
    await AuthenticationsTableTestHelper.cleanTable()
    await ThreadsTableTestHelper.cleanTable()
  })

  describe('when POST /threads', () => {
    it('should respond with 401 when request does not contain needed authentication', async () => {
      // Arrange
      const server = await createServer(container)
      const requestPayload = {
        title: 'sebuah thread',
        body: 'sebuah body thread'
      }

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload
      })

      // Assert
      expect(response.statusCode).toEqual(401)
      expect(response.result.message).toEqual('Missing authentication')
    })

    it('should respond with 400 when request payload not contain needed property', async () => {
      // Arrange
      const server = await createServer(container)
      const requestPayload = {
        title: 'sebuah thread'
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
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      // Assert
      expect(response.statusCode).toEqual(400)
      expect(response.result.message).toEqual('tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada')
    })

    it('should respond with 400 when request payload not meet data type specification', async () => {
      // Arrange
      const server = await createServer(container)
      const requestPayload = {
        title: 'sebuah thread',
        body: 123
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
          username: 'dicoding',
          password: 'secret'
        }
      })

      const { accessToken } = JSON.parse(authResponse.payload).data

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      // Assert
      expect(response.statusCode).toEqual(400)
      expect(response.result.message).toEqual('title dan body harus berupa string')
    })

    it('should respond with 201 and persisted thread', async () => {
      // Arrange
      const server = await createServer(container)
      const requestPayload = {
        title: 'sebuah thread',
        body: 'sebuah body thread'
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

      const authResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret'
        }
      })

      const { accessToken } = JSON.parse(authResponse.payload).data

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(201)
      expect(responseJson.status).toEqual('success')
      expect(responseJson.data.addedThread).toBeDefined()
      expect(responseJson.data.addedThread.title).toEqual(requestPayload.title)
      expect(responseJson.data.addedThread.owner).toEqual(userId)
      expect(ThreadsTableTestHelper.findThreadById(responseJson.data.addedThread.id)).toBeTruthy()
    })
  })

  describe('when GET /threads/{threadId}', () => {
    it('should respond with 200 and detail thread', async () => {
      // Arrange
      const server = await createServer(container)

      const userId = 'user-123'

      const mockThread = {
        id: 'thread-123',
        title: 'sebuah thread',
        body: 'sebuah body thread',
        date: '2022-01-01T00:00:00.000Z',
        owner: userId
      }

      const firstComment = {
        id: 'comment-123',
        content: 'sebuah comment',
        date: '2022-01-01T00:00:00.000Z',
        owner: userId,
        threadId: mockThread.id
      }

      const secondComment = {
        id: 'comment-456',
        content: 'sebuah comment juga',
        date: '2022-01-01T00:00:00.000Z',
        owner: userId,
        threadId: mockThread.id
      }

      const firstReply = {
        id: 'reply-123',
        content: 'sebuah reply',
        date: '2022-01-01T00:00:00.000Z',
        owner: userId,
        threadId: mockThread.id,
        commentId: firstComment.id
      }

      const secondReply = {
        id: 'reply-456',
        content: 'sebuah reply juga',
        date: '2022-01-01T00:00:00.000Z',
        owner: userId,
        threadId: mockThread.id,
        commentId: secondComment.id
      }

      await UsersTableTestHelper.addUser({ id: userId })
      await ThreadsTableTestHelper.addThread(mockThread)
      await CommentsTableTestHelper.addComment(firstComment)
      await CommentsTableTestHelper.addComment(secondComment)
      await CommentsTableTestHelper.deleteComment(secondComment.id)
      await RepliesTableTestHelper.addReply(firstReply)
      await RepliesTableTestHelper.addReply(secondReply)
      await RepliesTableTestHelper.deleteReply(secondReply.id)

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${mockThread.id}`
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(responseJson.status).toEqual('success')
      expect(response.statusCode).toEqual(200)
      expect(responseJson.data.thread).toBeDefined()
    })
  })
})
