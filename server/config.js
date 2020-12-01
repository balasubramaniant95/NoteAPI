module.exports = {
    mongodb: {
        hostname: 'mongo',
        port: 27017,
        db: 'myNotesDB',
        collection: 'myNotes'
    },
    noteAPI: {
        port: 3000
    },
    redis: {
        hostname: 'redis',
        port: 6379
    }
}