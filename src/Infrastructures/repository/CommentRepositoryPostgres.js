const CommentRepository = require('../../Domains/comments/CommentRepository.js')
const AddedComment = require('../../Domains/comments/entities/AddedComment.js')

const NotFoundError = require('../../Commons/exceptions/NotFoundError.js')

class CommentRepositoryPostgres extends CommentRepository {
  constructor (pool, idGenerator) {
    super()
    this._pool = pool
    this._idGenerator = idGenerator
  }

  async addComment (userId, threadId, createComment) {
    const { content } = createComment
    const owner = userId
    const id = `comment-${this._idGenerator()}`
    const date = new Date().toISOString()

    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5) RETURNING id, content, owner',
      values: [id, content, date, owner, threadId]
    }

    const result = await this._pool.query(query)

    return new AddedComment({ ...result.rows[0] })
  }

  async deleteComment (commentId) {
    const query = {
      text: 'UPDATE comments SET is_deleted = true WHERE id = $1',
      values: [commentId]
    }

    await this._pool.query(query)
  }

  async verifyCommentAvailability (commentId) {
    const query = {
      text: 'SELECT id FROM comments WHERE id = $1 AND is_deleted = false',
      values: [commentId]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('komentar tidak ditemukan')
    }
  }

  async verifyCommentOwner (commentId) {
    const query = {
      text: 'SELECT owner FROM comments WHERE id = $1',
      values: [commentId]
    }

    const result = await this._pool.query(query)

    const { owner } = result.rows[0]
    return owner
  }

  async getThreadComments (threadId) {
    const query = {
      text: 'SELECT id, content, date, owner, is_deleted FROM comments WHERE thread_id = $1 ORDER BY date ASC',
      values: [threadId]
    }

    const result = await this._pool.query(query)

    return result.rows
  }
}

module.exports = CommentRepositoryPostgres
