const AuthorizationError = require('./AuthorizationError')
const InvariantError = require('./InvariantError')
const NotFoundError = require('./NotFoundError')

const DomainErrorTranslator = {
  translate (error) {
    return DomainErrorTranslator._directories[error.message] || error
  }
}

DomainErrorTranslator._directories = {
  // Routes
  'Not Found': new NotFoundError('Route tidak ditemukan'),

  // Users
  'REGISTER_USER.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('tidak dapat membuat user baru karena properti yang dibutuhkan tidak ada'),
  'REGISTER_USER.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('tidak dapat membuat user baru karena tipe data tidak sesuai'),
  'REGISTER_USER.USERNAME_LIMIT_CHAR': new InvariantError('tidak dapat membuat user baru karena karakter username melebihi batas limit'),
  'REGISTER_USER.USERNAME_CONTAIN_RESTRICTED_CHARACTER': new InvariantError('tidak dapat membuat user baru karena username mengandung karakter terlarang'),
  'USER_LOGIN.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('harus mengirimkan username dan password'),
  'USER_LOGIN.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('username dan password harus string'),
  'REFRESH_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN': new InvariantError('harus mengirimkan token refresh'),
  'REFRESH_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('refresh token harus string'),
  'DELETE_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN': new InvariantError('harus mengirimkan token refresh'),
  'DELETE_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('refresh token harus string'),

  // Threads
  'THREAD.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada'),
  'THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('title dan body harus berupa string'),

  // Comments
  'COMMENT.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('tidak dapat membuat comment baru karena properti yang dibutuhkan tidak ada'),
  'COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('content harus berupa string'),
  'DELETE_COMMENT_USE_CASE.USER_IS_NOT_COMMENT_OWNER': new AuthorizationError('anda tidak berhak menghapus komentar ini'),

  // Replies
  'CREATE_REPLY.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('tidak dapat membuat reply baru karena properti yang dibutuhkan tidak ada'),
  'CREATE_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('content harus berupa string'),
  'DELETE_REPLY_USE_CASE.USER_IS_NOT_REPLY_OWNER': new AuthorizationError('anda tidak berhak menghapus balasan ini')
}

module.exports = DomainErrorTranslator
