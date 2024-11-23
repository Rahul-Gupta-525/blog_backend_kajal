const postModel = require('../models/blog');
const userModel = require('../models/users')
const fs = require('fs'); 
const path = require('path'); 

// Create Post API
exports.createPost = async (req, res) => {
    console.log(req.body)
    try {
        const { userId, title, content, tags } = req.body;

        if (!userId || !title || !content || !tags || !req.file) {
            return res.status(400).json({ message: "all fields are required"});
        }

        // Construct the photo URL
        const imageUrl = `/uploads/${req.file.filename}` ;

        const newPost = new postModel({
            userId,
            title,
            content,
            image: imageUrl, 
            tags,
        });

        await newPost.save();

        res.status(201).json({ message: "blogPost created successfully", post: newPost });
    } catch (err) {
        res.status(500).json({ message: "An error occurred while creating the blogPost", error: err.message });
    }
};

// Get Posts
exports.getAllPosts = async (req, res) => {
    try {
        const posts = await postModel.find()
        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get Post by ID
exports.getUsersPost = async (req, res) => {
    try {
        console.log("ssaas",req.params.id)
        const userPost = await postModel.find({userId: req.params.id}).populate("userId", "name email");
        console.log("post",userPost)

        if (!userPost) return res.status(404).json({ message: "Post not found" });
        res.status(200).json(userPost);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getPostById = async (req, res) => {
    try {
        console.log("ssaas",req.params.id)
        const userPost = await postModel.findById(req.params.id)
        console.log("post",userPost)

        if (!userPost) return res.status(404).json({ message: "Post not found" });
        res.status(200).json(userPost);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updatePost = async (req, res) => {
    try {
        const { title, content, tags } = req.body;

        // Find the existing post
        const existingPost = await postModel.findById(req.params.id);
        if (!existingPost) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Check if a new file is uploaded
        let imageUrl = existingPost.image; 
        if (req.file) {
            // Construct the new image URL
            imageUrl = `/uploads/${req.file.filename}`;

            // Remove the old image file from the server (if necessary)
            if (existingPost.image) {
                const oldImagePath = path.join(__dirname, '..', 'public/uploads', path.basename(existingPost.image));
                fs.unlink(oldImagePath, (err) => {
                    if (err) console.error(`Failed to delete old image: ${err.message}`);
                });
            }
        }

        const updatedPost = await postModel.findByIdAndUpdate(
            req.params.id,
            { title, content, image: imageUrl, tags },
            { new: true }
        );

        res.status(200).json({ message: "Post updated successfully", Post: updatedPost });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
// Delete a Post
exports.deletePost = async (req, res) => {
    try {
        const deletedPost = await postModel.findByIdAndDelete(req.params.id);
        if (!deletedPost) return res.status(404).json({ message: "Post not found" });
        res.status(200).json({ message: "Post deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateLikes = async (req, res) => {
    try {
        const { postid } = req.params;
        const userId = req.user.id;
        console.log(userId)
        console.log("userId", userId)
        const blogPost = await postModel.findById(postid);
        if (!blogPost) {
            return res.status(404).json({ message: "Post not found" });
        }
        // is post liked
        const isLiked = blogPost?.likes?.map(like => like?.userId?.toString()).includes(userId);
console.log("isLiked", isLiked)
       
        if (isLiked) {
            blogPost.likes = blogPost.likes.filter(like => like?.userId?.toString() !== userId);
        } else {
            const user = await userModel.findById(userId, 'name');
            blogPost.likes.push({ userId, userName: user.name });
        }

        await blogPost.save();

        res.status(200).json({
            message: isLiked ? "Post unliked successfully" : "Post liked successfully",
            likesCount: blogPost.likes.length,
            likes: blogPost.likes, 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.handleNewComment = async(io, socket, data) =>{
    const { blogId, comment } = data;

    try {
        const blogPost = await postModel.findById(blogId);
        if (!blogPost) {
            socket.emit("error", "Blog not found");
            return;
        }

        // new comment added to blog
        blogPost.comments.push(comment);
        await blogPost.save();

        // Emit new comment 
        io.to(blogId).emit("commentAdded", { blogId, comment }); 

    } catch (err) {
        console.error(err);
        socket.emit("error", "Error adding comment");
    }
}


