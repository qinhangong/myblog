const express = require('express');
const router = express.Router();
const checkLogin = require('../middlewares/check').checkLogin;
const postModel = require('../models/posts');
const CommentModel = require('../models/comments');

router.get('/', function (req, res, next) {
    const author = req.query.author;
    postModel.getPosts(author)
        .then(function (posts) {
            res.render('posts', {
                posts: posts
            })
        })
        .catch(next)
})

router.get('/create', checkLogin, function (req, res, next) {
    res.render('create');
})


router.post('/create', checkLogin, function (req, res, next) {
    const author = req.session.user._id;
    const title = req.fields.title;
    const content = req.fields.content;
    try {
        if (!title.length) {
            throw new Error('请填写标题');
        }
        if (!content.length) {
            throw new Error('请填写内容');
        }
    } catch (err) {
        req.flash('error', e.message);
        return  res.redirect('back');
    }
    let post = {
        author: author,
        title: title,
        content: content
    };
    postModel.create(post)
        .then(function (result) {
            post = result.ops[0];
            req.flash('success', '发表成功');
            return res.redirect(`/posts/${post._id}`);
        })
        .catch(next)
})


router.get('/:postId', function (req, res, next) {
    const postId = req.params.postId
    Promise.all([
        postModel.getPostById(postId), // 获取文章信息
        CommentModel.getComments(postId),//获取该文章的所有留言
        postModel.incPv(postId)// pv 加 1
    ]).then(function (result) {
        const post = result[0];
        const comments = result[1]
        if (!post) {
            throw new Error('该文章不存在')
        }
        res.render('post', {
            post: post,
            comments:comments
        })
    }).catch(next)
})

router.get('/:postId/edit', checkLogin, function (req, res, next) {
    const postId = req.params.postId;
    const author = req.session.user._id;
    postModel.getRawPostById(postId)
    .then(function(post){
        if(!post){
            throw new Error('该文章不存在');
        }
        if(author.toString() !== post.author._id.toString()){
            throw new Error('权限不足');
        }
        res.render('edit',{
            post:post
        })
    })
    .catch(next)
})

router.post('/:postId/edit', checkLogin, function (req, res, next) {
    const postId = req.params.postId;
    const title = req.fields.title;
    const content = req.fields.content;
    
    try{
        if(!title.length) throw new Error('请填写标题');
        if(!content.length) throw new Error('请填写内容');
    }catch(err){
        req.flash('error', err.message);
        return res.redirect('back');
    }

    postModel.updatePostById(postId,{title:title,content:content})
    .then(function(){
        req.flash('success', '编辑文章成功');
        return res.redirect(`/posts/${postId}`);
    })
    .catch(next)
})

router.get('/:postId/remove', checkLogin, function (req, res, next) {
    const postId = req.params.postId;
    postModel.delPostById(postId)
    .then(function(){
        req.flash('success','删除文章成功');
        return res.redirect('/posts')
    })
    .catch(next)
})

module.exports = router;