const ThreadRepository = require('../../Domains/threads/ThreadRepository')
const AddedThread = require('../../Domains/threads/entities/AddedThread')
const NotFoundError = require('../../Commons/exceptions/NotFoundError')
class ThreadRepositoryPostgres extends ThreadRepository {
  constructor (pool, idGenerator) {
    super()
    this._pool = pool
    this._idGenerator = idGenerator
  }

  async addThread (userId, createThread) {
    const { title, body } = createThread
    const owner = userId

    const id = `thread-${this._idGenerator()}`
    const date = new Date().toISOString()

    const query = {
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4, $5) RETURNING id, title, owner',
      values: [id, title, body, date, owner]
    }

    const result = await this._pool.query(query)

    return new AddedThread({ ...result.rows[0] })
  }

  async getThreadById (id) {
    const query = {
      text: 'SELECT * FROM threads WHERE id = $1',
      values: [id]
    }

    const result = await this._pool.query(query)

    return result.rows[0]
  }

  async verifyThreadAvailability (id) {
    const query = {
      text: 'SELECT id FROM threads WHERE id = $1',
      values: [id]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('thread tidak ditemukan')
    }
  }
}

module.exports = ThreadRepositoryPostgres
