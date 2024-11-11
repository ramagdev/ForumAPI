/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool')

const RepliesTableTestHelper = {

  async addReply ({
    id = 'reply-123',
    content = 'sebuah balasan',
    owner = 'user-123',
    date = new Date(),
    commentId = 'comment-123',
    threadId = 'thread-123'
  }) {
    const query = {
      text: 'INSERT INTO replies VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, owner',
      values: [id, content, date, owner, commentId, threadId]
    }

    await pool.query(query)
  },

  async findReplyById (id) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1',
      values: [id]
    }

    const result = await pool.query(query)
    return result.rows
  },

  async checkIfReplyIsDeleted (id) {
    const query = {
      text: 'SELECT is_deleted FROM replies WHERE id = $1',
      values: [id]
    }

    const result = await pool.query(query)
    return result.rows.map(row => row.is_deleted)
  },

  async deleteReply (id) {
    const query = {
      text: 'UPDATE replies SET is_deleted = true WHERE id = $1',
      values: [id]
    }

    await pool.query(query)
  },

  async cleanTable () {
    await pool.query('DELETE FROM replies WHERE 1=1')
  }
}

module.exports = RepliesTableTestHelper
