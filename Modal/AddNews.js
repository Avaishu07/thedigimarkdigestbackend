const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    imageUrl: {
        type: String,
        required: false, // Assuming this is optional
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

const AddNews = mongoose.model('Newspost', blogPostSchema);

module.exports = AddNews;
