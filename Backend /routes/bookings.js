const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Showtime = require('../models/Showtime');

// Get all bookings
router.get('/', async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('movieId', 'title')
            .populate('showtimeId', 'time theater')
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a booking
router.post('/', async (req, res) => {
    const session = await Booking.startSession();
    session.startTransaction();

    try {
        const { movieId, showtimeId, seats, totalPrice } = req.body;

        // Check if showtime exists
        const showtime = await Showtime.findById(showtimeId);
        if (!showtime) {
            throw new Error('Showtime not found');
        }

        // Check if seats are available
        const bookedSeats = showtime.bookedSeats || [];
        const unavailableSeats = seats.filter(seat => bookedSeats.includes(seat));
        
        if (unavailableSeats.length > 0) {
            throw new Error(`Seats ${unavailableSeats.join(', ')} are already booked`);
        }

        // Create booking
        const booking = new Booking({
            movieId,
            showtimeId,
            seats,
            totalPrice
        });

        await booking.save({ session });

        // Update showtime booked seats
        showtime.bookedSeats = [...bookedSeats, ...seats];
        await showtime.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.status(201).json(booking);
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(400).json({ message: error.message });
    }
});

// Cancel booking
router.delete('/:id', async (req, res) => {
    const session = await Booking.startSession();
    session.startTransaction();

    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            throw new Error('Booking not found');
        }

        // Remove seats from showtime
        const showtime = await Showtime.findById(booking.showtimeId);
        if (showtime) {
            showtime.bookedSeats = showtime.bookedSeats.filter(
                seat => !booking.seats.includes(seat)
            );
            await showtime.save({ session });
        }

        booking.status = 'cancelled';
        await booking.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.json({ message: 'Booking cancelled successfully' });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
