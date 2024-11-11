const ThreadDetail = require('../ThreadDetail')

describe('ThreadDetail entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      thread: {},
      threadComments: []
    }

    // Action and Assert
    expect(() => new ThreadDetail(payload)).toThrowError('THREAD_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY')
  })

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      thread: 123,
      threadComments: [],
      threadReplies: []
    }

    // Action and Assert
    expect(() => new ThreadDetail(payload)).toThrowError('THREAD_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION')
  })
})

describe('formattedDetail getter', () => {
  it('should return formatted detail correctly', () => {
    // Arrange
    const payload = {
      thread: {
        id: 'thread-123',
        title: 'sebuah thread',
        body: 'sebuah body thread',
        date: '2020-01-01T00:00:00.000Z',
        owner: 'user-123',
        username: 'dicoding'
      },
      threadComments: [
        {
          id: 'comment-123',
          content: 'sebuah comment',
          date: '2020-01-01T00:00:00.000Z',
          owner: 'user-1234',
          username: 'awsdicoding'
        },
        {
          id: 'comment-456',
          content: '**komentar telah dihapus**',
          date: '2020-01-01T00:00:00.000Z',
          owner: 'user-12345',
          username: 'awsdicodingindonesia'
        }
      ],
      threadReplies: [
        {
          id: 'reply-123',
          content: 'sebuah balasan',
          date: '2020-01-01T00:00:00.000Z',
          owner: 'user-12345',
          comment_id: 'comment-123',
          username: 'awsdicodingindonesia'
        },
        {
          id: 'reply-456',
          content: '**balasan telah dihapus**',
          date: '2020-01-01T00:00:00.000Z',
          owner: 'user-12345',
          comment_id: 'comment-456',
          username: 'awsdicodingindonesia'
        }
      ]
    }

    expectedFormattedDetail = {
      thread: {
        id: 'thread-123',
        title: 'sebuah thread',
        body: 'sebuah body thread',
        date: '2020-01-01T00:00:00.000Z',
        username: 'dicoding',
        comments: [
          {
            id: 'comment-123',
            username: 'awsdicoding',
            date: '2020-01-01T00:00:00.000Z',
            replies: [{
              id: 'reply-123',
              content: 'sebuah balasan',
              date: '2020-01-01T00:00:00.000Z',
              username: 'awsdicodingindonesia'
            }],
            content: 'sebuah comment'
          },
          {
            id: 'comment-456',
            username: 'awsdicodingindonesia',
            date: '2020-01-01T00:00:00.000Z',
            replies: [
              {
                id: 'reply-456',
                content: '**balasan telah dihapus**',
                date: '2020-01-01T00:00:00.000Z',
                username: 'awsdicodingindonesia'
              }
            ],
            content: '**komentar telah dihapus**'
          }
        ]
      }
    }

    // Action
    const threadDetail = new ThreadDetail(payload)

    // Assert
    expect(threadDetail.formattedDetail).toStrictEqual(expectedFormattedDetail)
  })
})
