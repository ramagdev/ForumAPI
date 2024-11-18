exports.up = pgm => {
  pgm.createTable('likes', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true
    },
    comment_id: {
      type: 'VARCHAR(50)',
      notNull: true
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true
    },
    is_liked: {
      type: 'BOOLEAN',
      notNull: true,
      default: true
    }
  })

  pgm.addConstraint('likes', 'fk_likes.comment_id_comments.id', 'FOREIGN KEY(comment_id) REFERENCES comments(id) ON DELETE CASCADE')
  pgm.addConstraint('likes', 'fk_likes.user_id_users.id', 'FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE')
  pgm.addConstraint('likes', 'unique_comment_id_user_id', 'UNIQUE(comment_id, user_id)')
}

exports.down = pgm => {
  pgm.dropTable('likes')
}
