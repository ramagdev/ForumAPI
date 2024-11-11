const CommentsHandler = require('./handler')
const routes = require('./routes')

module.exports = {
  name: 'replies',

  register: async (server, { container }) => {
    const repliesHandler = new CommentsHandler(container)
    server.route(routes(repliesHandler))
  }
}
