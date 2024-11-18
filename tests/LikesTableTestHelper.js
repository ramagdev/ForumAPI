/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool')

const LikesTableTestHelper = {
  async addLike ({ id = 'like-123', commentId = 'comment-123', userId = 'user-123' }) {
    const query = {
      text: 'INSERT INTO likes VALUES($1, $2, $3)',
      values: [id, commentId, userId]
    }

    await pool.query(query)
  },
  async getLikeCount (commentId = 'comment-123') {
    const query = {
      text: 'SELECT COUNT(*)::INT FROM likes WHERE comment_id = $1 and is_liked',
      values: [commentId]
    }

    const result = await pool.query(query)
    return result.rows[0].count
  },
  async cleanTable () {
    await pool.query('DELETE FROM likes WHERE 1=1')
  }
}

module.exports = LikesTableTestHelper
