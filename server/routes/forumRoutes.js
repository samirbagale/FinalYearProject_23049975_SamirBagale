const express = require('express');
const { protect } = require('../middleware/auth');
const forumController = require('../controllers/forumController');

const router = express.Router();

router.use(protect); // Protect all routes below

// Posts
router.route('/posts')
    .get(forumController.getPosts)
    .post(forumController.createPost);

router.route('/posts/:id')
    .get(forumController.getPost)
    .delete(forumController.deletePost);

// Comments
router.route('/posts/:postId/comments')
    .get(forumController.getComments)
    .post(forumController.addComment);

router.route('/comments/:id')
    .delete(forumController.deleteComment);

// Likes
router.route('/posts/:postId/like')
    .post(forumController.toggleLikePost);

module.exports = router;
