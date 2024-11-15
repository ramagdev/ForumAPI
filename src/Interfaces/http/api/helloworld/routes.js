const routes = () => ([
    {
        method: 'GET',
        path: '/',
        handler: () => ({
            data: 'Bam Bam, Hello world!',
        })
    }
])

module.exports = routes