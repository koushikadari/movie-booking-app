const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    movieId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie',
        required: true
    },
    showtimeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Showtime',
        required: true
    },
    seats: [{
        type: Number,
        required: true
    }],
    totalPrice: {
        type: Number,
        required: true
    },
    bookingReference: {
        type: String,
        unique: true,
        default: () => 'BK' + Date.now().toString(36).toUpperCase()
    },
    status: {
        type: String,
        enum: ['confirmed', 'cancelled'],
        default: 'confirmed'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);
