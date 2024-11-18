const LikeRepository = require('../../Domains/likes/LikeRepository')

class LikeRepositoryPostgres extends LikeRepository {
  constructor (pool, idGenerator) {
    super()
    this._pool = pool
    this._idGenerator = idGenerator
  }

  async updateLike (commentId, userId) {
    const query = {
      text: 'UPDATE likes SET is_liked = NOT is_liked WHERE comment_id = $1 AND user_id = $2 RETURNING id',
      values: [commentId, userId]
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      const id = `like-${this._idGenerator()}`
      const query = {
        text: 'INSERT INTO likes VALUES($1, $2, $3) RETURNING id',
        values: [id, commentId, userId]
      }

      await this._pool.query(query)
    }
  }

  async getLikeCount (commentId) {
    const query = {
      text: 'SELECT COUNT(*)::INT FROM likes WHERE comment_id = $1 AND is_liked',
      values: [commentId]
    }

    const result = await this._pool.query(query)

    return result.rows[0].count
  }
}

module.exports = LikeRepositoryPostgres
