const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    comment: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const BlogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: true,
        min: 4,
    },
    content: {
        type: String,
        required: true,
        min: 12,
    },
    image: {
        type: String,
        required: true,
    },
    tags: {
        type: String,
        required: true,
    },
    likes: {
        type: [{
            userId: {
                type: mongoose.Types.ObjectId,
                ref: 'User',
            },
            userName: {
                type: String,
            },
        },], 
        default: [],
    },
    comments: {
        type: [CommentSchema],
        default: [],
    },
}, { timestamps: true });

module.exports = mongoose.model("Blog", BlogSchema);
