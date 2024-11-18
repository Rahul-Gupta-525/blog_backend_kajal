const express = require('express');
const router = express.Router();
const {createPost, getAllPosts, getPostById,getUsersPost, updatePost, deletePost, updateLikes} = require('../controllers/postControllers');
const {upload} = require('../config/multerConfig')
const {AuthMiddleware} = require('../middlewares/authMiddlewares')

// Post routes
router.post('/post',AuthMiddleware, upload.single('image'), createPost);
router.get('/post', getAllPosts);
router.get('/post/:id', getPostById);
router.get('/user/post/:id', getUsersPost);
router.put('/post/:id', AuthMiddleware, upload.single("image"), updatePost);
router.delete('/delete/post/:id',AuthMiddleware, deletePost);
// likes Route
router.post('/like/post/:postid',AuthMiddleware, updateLikes);


module.exports = router;
