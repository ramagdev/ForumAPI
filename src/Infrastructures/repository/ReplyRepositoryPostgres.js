const ReplyRepository = require('../../Domains/replies/ReplyRepository')
const AddedReply = require('../../Domains/replies/entities/AddedReply')
const NotFoundError = require('../../Commons/exceptions/NotFoundError')

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor (pool, idGenerator) {
    super()
    this._pool = pool
    this._idGenerator = idGenerator
  }

  async addReply (userId, threadId, commentId, createReply) {
    const { content } = createReply
    const owner = userId
    const id = `reply-${this._idGenerator()}`
    const date = new Date().toISOString()

    const query = {
      text: 'INSERT INTO replies VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, owner',
      values: [id, content, date, owner, commentId, threadId]
    }

    const result = await this._pool.query(query)

    return new AddedReply({ ...result.rows[0] })
  }

  async deleteReply (replyId) {
    const query = {
      text: 'UPDATE replies SET is_deleted = true WHERE id = $1',
      values: [replyId]
    }

    await this._pool.query(query)
  }

  async verifyReplyAvailability (replyId) {
    const query = {
      text: 'SELECT id FROM replies WHERE id = $1 AND is_deleted = false',
      values: [replyId]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('balasan tidak ditemukan')
    }
  }

  async verifyReplyOwner (replyId) {
    const query = {
      text: 'SELECT owner FROM replies WHERE id = $1',
      values: [replyId]
    }

    const result = await this._pool.query(query)

    return result.rows[0].owner
  }

  async getThreadReplies (threadId) {
    const query = {
      text: 'SELECT id, content, date, owner, comment_id, is_deleted FROM replies WHERE thread_id = $1 ORDER BY date ASC',
      values: [threadId]
    }

    const result = await this._pool.query(query)

    return result.rows
  }
}

module.exports = ReplyRepositoryPostgres
