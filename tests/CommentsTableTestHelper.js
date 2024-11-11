/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool')

const CommentsTableTestHelper = {

  async addComment ({ id = 'comment-123', content = 'sebuah comment', owner = 'user-123', date = new Date(), threadId = 'thread-123' }) {
    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5) RETURNING id, content, owner',
      values: [id, content, date, owner, threadId]
    }

    await pool.query(query)
  },

  async findCommentById (id) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [id]
    }

    const result = await pool.query(query)
    return result.rows
  },

  async checkIfCommentDeleted (id) {
    const query = {
      text: 'SELECT is_deleted FROM comments WHERE id = $1',
      values: [id]
    }

    const result = await pool.query(query)
    return result.rows.map(row => row.is_deleted)
  },

  async deleteComment (id) {
    const query = {
      text: 'UPDATE comments SET is_deleted = true WHERE id = $1',
      values: [id]
    }

    await pool.query(query)
  },

  async cleanTable () {
    await pool.query('DELETE FROM comments WHERE 1=1')
  }

}

module.exports = CommentsTableTestHelper
