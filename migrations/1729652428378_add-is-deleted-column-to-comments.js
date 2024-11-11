exports.up = pgm => {
  pgm.addColumn('comments', {
    is_deleted: {
      type: 'BOOLEAN',
      notNull: true,
      default: false
    }
  })
}

exports.down = pgm => {
  pgm.dropColumn('comments', 'is_deleted')
}
