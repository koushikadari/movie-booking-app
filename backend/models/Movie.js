const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    genre: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    rating: {
        type: Number,
        min: 0,
        max: 10,
        default: 0
    },
    releaseDate: {
        type: Date,
        required: true
    },
    poster: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Movie', movieSchema);
