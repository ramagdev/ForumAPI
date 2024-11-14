const routes = require('./routes')

module.exports = {
    name: 'helloworld',

    register: async (server) => {
        server.route(routes())
    }
}