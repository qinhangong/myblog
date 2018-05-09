const express = require('express');
const router = express.Router();
const checkLogin = require('../middlewares/check').checkLogin;
const CommentModel = require('../models/comments');


router.post('/', checkLogin, function (req, res, next) {
    const author = req.session.user._id;
    const postId = req.fields.postId;
    const content = req.fields.content;

    try{
        if(!content.length){
            throw new Error('留言不能为空');
        }
    }catch(err){
         req.flash('error',err.message);
         return res.redirect('back');
    }

    const comment ={
        author,
        postId,
        content,
    }

    CommentModel.create(comment)
    .then(()=>{
        req.flash('success','留言成功');
        return res.redirect('back');
    })
    .catch(next)
})

router.get('/:commentId/remove', checkLogin, function (req, res, next) {
    const commentId = req.params.commentId;
    const author = req.session.user._id;
    CommentModel.getCommentById(commentId)
    .then(comment=>{
        if(comment.author._id.toString() !== author.toString()){
            throw new Error('没有权限删除留言');
        }
        CommentModel.delCommentById(commentId)
        .then(()=>{
            req.flash('success','删除留言成功');
            return res.redirect('back');
        })
        .catch(next)
    })
})

module.exports = router;