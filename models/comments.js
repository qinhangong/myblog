const Comment = require('../lib/mongo').Comment;

module.exports = {
    create: function (comment) {
        return Comment.create(comment).exec();
    },
    getCommentById: function (commentId) {
        return Comment.findOne({ _id: commentId })
            .populate({ path: 'author', model: 'User' })
            .exec();
    },
    delCommentById: function (commentId) {
        return Comment.deleteOne({ _id: commentId }).exec();
    },
    // 通过文章 id 删除该文章下所有留言
    delCommentsByPostId: function (postId) {
        return Comment.deleteMany({ postId: postId }).exec();
    },
    getComments: function (postId) {
        return Comment.find({ postId: postId })
            .populate({ path: 'author', model: 'User' })
            .sort({ _id: 1 })
            .addCreatedAt()
            .exec()
    },
    getCommentsCount: function (postId) {
        return Comment.count({ postId: postId }).exec();
    }
}