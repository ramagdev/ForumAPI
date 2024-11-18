/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool')

const LikesTableTestHelper = {
  async addLike (id = 'like-123', commentId = 'comment-123', userId = 'user-123', like = true) {
    const query = {
      text: 'INSERT INTO likes VALUES($1, $2, $3, $4) RETURNING id, comment_id, user_id, like',
      values: [id, commentId, userId, like]
    }

    const result = await pool.query(query)
    return result.rows[0]
  },

  async dislikeComment (id = 'like-123', commentId = 'comment-123', userId = 'user-123', like = false) {
    const query = {
      text: 'INSERT INTO likes VALUES($1, $2, $3, $4) RETURNING id, comment_id, user_id, like',
      values: [id, commentId, userId, like]
    }

    const result = await pool.query(query)
    return result.rows[0]
  },

  async findLikeCount (commentId = 'comment-123') {
    const query = {
      text: ' SELECT COUNT(*) FROM likes WHERE comment_id = $1',
      values: [commentId]
    }

    const result = await pool.query(query)
    return result.rows
  },
  async cleanTable () {
    await pool.query('DELETE FROM likes WHERE 1=1')
  }
}

module.exports = LikesTableTestHelper
