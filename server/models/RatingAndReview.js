const mongoose = require('mongoose');

const ratingAndReview = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    rating: {
        type: Number,
        required: true,
    },
    review: {
        type: String,
        required: true,
    },
});

modules.exports = mongoose.model('RatingAndReview', ratingAndReview);