const routes = () => ([
    {
        method: 'GET',
        path: '/',
        handler: () => ({
            data: 'Hello world!',
        })
    }
])

module.exports = routes