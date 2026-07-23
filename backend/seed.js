const mongoose = require('mongoose');
require('dotenv').config();

const Movie = require('./models/Movie');
const Showtime = require('./models/Showtime');

const movies = [
    {
        title: "Inception",
        description: "A thief who steals corporate secrets through dream-sharing technology.",
        genre: "Sci-Fi",
        duration: 148,
        rating: 8.8,
        releaseDate: new Date('2010-07-16'),
        director: "Christopher Nolan"
    },
    {
        title: "The Dark Knight",
        description: "When the Joker wreaks havoc on Gotham, Batman must stop him.",
        genre: "Action",
        duration: 152,
        rating: 9.0,
        releaseDate: new Date('2008-07-18'),
        director: "Christopher Nolan"
    },
    {
        title: "Interstellar",
        description: "A team of explorers travel through a wormhole to save humanity.",
        genre: "Sci-Fi",
        duration: 169,
        rating: 8.6,
        releaseDate: new Date('2014-11-07'),
        director: "Christopher Nolan"
    }
];

async function seedDatabase() {
    try {
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongodb:27017/movie_booking_db';
        await mongoose.connect(MONGODB_URI);
        console.log('📊 Connected to MongoDB');
        
        // Clear existing data
        await Movie.deleteMany({});
        await Showtime.deleteMany({});
        console.log('🗑️  Cleared existing data');
        
        // Insert movies
        const insertedMovies = await Movie.insertMany(movies);
        console.log(`✅ Inserted ${insertedMovies.length} movies`);
        
        // Create showtimes for each movie
        const showtimes = [];
        const times = ["10:00 AM", "1:00 PM", "4:00 PM", "7:00 PM"];
        
        insertedMovies.forEach(movie => {
            for (let day = 0; day < 3; day++) {
                const date = new Date();
                date.setDate(date.getDate() + day);
                
                times.forEach((time, index) => {
                    showtimes.push({
                        movieId: movie._id,
                        theater: `Cinema ${Math.floor(index / 2) + 1}`,
                        screen: `Screen ${index + 1}`,
                        time: time,
                        date: date,
                        totalSeats: 40,
                        bookedSeats: [],
                        price: 12 + (index * 2)
                    });
                });
            }
        });
        
        await Showtime.insertMany(showtimes);
        console.log(`✅ Inserted ${showtimes.length} showtimes`);
        
        console.log('\n🎉 Database seeding completed!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();
