const LikeRepository = require('../LikeRepository')

describe('LikesRepository interface', () => {
  it('should throw an error when invoke unimplemented method', async () => {
    // Arrange
    const likeRepository = new LikeRepository()

    // Action and Assert
    await expect(likeRepository.updateLike('')).rejects.toThrowError('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED')
    await expect(likeRepository.getLikeCount('')).rejects.toThrowError('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED')
  })
})
