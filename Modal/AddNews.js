const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: false,
    },
    category: {
        type: String,
        required: false,
    },
    content: {
        type: String,
        required: false,
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
