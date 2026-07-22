const express = require('express');
const router = express.Router();
const Showtime = require('../models/Showtime');

// Get showtimes for a movie
router.get('/', async (req, res) => {
    try {
        const { movieId } = req.query;
        const filter = movieId ? { movieId } : {};
        const showtimes = await Showtime.find(filter)
            .populate('movieId', 'title')
            .sort({ date: 1, time: 1 });
        res.json(showtimes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single showtime
router.get('/:id', async (req, res) => {
    try {
        const showtime = await Showtime.findById(req.params.id)
            .populate('movieId', 'title');
        if (!showtime) {
            return res.status(404).json({ message: 'Showtime not found' });
        }
        res.json(showtime);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get seats for a showtime
router.get('/:id/seats', async (req, res) => {
    try {
        const showtime = await Showtime.findById(req.params.id);
        if (!showtime) {
            return res.status(404).json({ message: 'Showtime not found' });
        }
        res.json({
            totalSeats: showtime.totalSeats,
            bookedSeats: showtime.bookedSeats
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create showtime (admin only - for demo)
router.post('/', async (req, res) => {
    try {
        const showtime = new Showtime(req.body);
        const newShowtime = await showtime.save();
        res.status(201).json(newShowtime);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
