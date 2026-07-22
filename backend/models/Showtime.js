const mongoose = require('mongoose');

const showtimeSchema = new mongoose.Schema({
    movieId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie',
        required: true
    },
    theater: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    totalSeats: {
        type: Number,
        default: 40
    },
    bookedSeats: [{
        type: Number
    }]
}, {
    timestamps: true
});

// Virtual for available seats
showtimeSchema.virtual('availableSeats').get(function() {
    return this.totalSeats - this.bookedSeats.length;
});

showtimeSchema.set('toJSON', { virtuals: true });
showtimeSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Showtime', showtimeSchema);
