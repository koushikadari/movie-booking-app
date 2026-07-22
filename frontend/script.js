const API_URL = 'http://localhost:5000/api';

// State
let currentMovie = null;
let currentShowtime = null;
let selectedSeats = [];
let bookedSeats = [];

// DOM Elements
const moviesSection = document.getElementById('moviesSection');
const showtimesSection = document.getElementById('showtimesSection');
const seatsSection = document.getElementById('seatsSection');
const myBookingsSection = document.getElementById('myBookingsSection');
const moviesGrid = document.getElementById('moviesGrid');
const showtimesList = document.getElementById('showtimesList');
const seatsContainer = document.getElementById('seatsContainer');
const selectedMovieTitle = document.getElementById('selectedMovieTitle');
const seatSelectionTitle = document.getElementById('seatSelectionTitle');
const selectedSeatsDisplay = document.getElementById('selectedSeatsDisplay');
const totalPrice = document.getElementById('totalPrice');
const confirmBtn = document.getElementById('confirmBookingBtn');
const bookingsList = document.getElementById('bookingsList');
const notification = document.getElementById('notification');

// Navigation
document.getElementById('homeBtn').addEventListener('click', () => showSection('movies'));
document.getElementById('myBookingsBtn').addEventListener('click', () => {
    showSection('bookings');
    loadBookings();
});
document.getElementById('backToMovies').addEventListener('click', () => showSection('movies'));
document.getElementById('backToShowtimes').addEventListener('click', () => showSection('showtimes'));

// Load Movies
async function loadMovies() {
    try {
        const response = await fetch(`${API_URL}/movies`);
        const movies = await response.json();
        renderMovies(movies);
    } catch (error) {
        showNotification('Error loading movies', 'error');
    }
}

// Render Movies
function renderMovies(movies) {
    moviesGrid.innerHTML = movies.map(movie => `
        <div class="movie-card" onclick="selectMovie('${movie._id}')">
            <div class="movie-poster" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display:flex; align-items:center; justify-content:center; color:white; font-size:48px;">
                🎬
            </div>
            <div class="movie-info">
                <h3>${movie.title}</h3>
                <p>⭐ ${movie.rating || 'N/A'}</p>
                <p>${movie.duration || 'N/A'} min</p>
                <span class="genre">${movie.genre || 'General'}</span>
            </div>
        </div>
    `).join('');
}

// Select Movie
async function selectMovie(movieId) {
    try {
        const response = await fetch(`${API_URL}/movies/${movieId}`);
        currentMovie = await response.json();
        selectedMovieTitle.textContent = currentMovie.title;
        showSection('showtimes');
        await loadShowtimes(movieId);
    } catch (error) {
        showNotification('Error loading showtimes', 'error');
    }
}

// Load Showtimes
async function loadShowtimes(movieId) {
    try {
        const response = await fetch(`${API_URL}/showtimes?movieId=${movieId}`);
        const showtimes = await response.json();
        renderShowtimes(showtimes);
    } catch (error) {
        showNotification('Error loading showtimes', 'error');
    }
}

// Render Showtimes
function renderShowtimes(showtimes) {
    showtimesList.innerHTML = showtimes.map(st => `
        <div class="showtime-item">
            <div>
                <strong>${st.time}</strong> - ${st.theater}
                <span style="margin-left:15px;color:#666;">Available: ${st.availableSeats}</span>
            </div>
            <button onclick="selectShowtime('${st._id}')">Select Seats</button>
        </div>
    `).join('') || '<p>No showtimes available</p>';
}

// Select Showtime
async function selectShowtime(showtimeId) {
    try {
        const response = await fetch(`${API_URL}/showtimes/${showtimeId}`);
        currentShowtime = await response.json();
        seatSelectionTitle.textContent = `${currentMovie.title} - ${currentShowtime.time}`;
        showSection('seats');
        await loadSeats(showtimeId);
    } catch (error) {
        showNotification('Error loading seats', 'error');
    }
}

// Load Seats
async function loadSeats(showtimeId) {
    try {
        const response = await fetch(`${API_URL}/showtimes/${showtimeId}/seats`);
        const data = await response.json();
        bookedSeats = data.bookedSeats;
        renderSeats(data.totalSeats);
    } catch (error) {
        showNotification('Error loading seats', 'error');
    }
}

// Render Seats
function renderSeats(totalSeats) {
    selectedSeats = [];
    updateBookingSummary();
    seatsContainer.innerHTML = '';
    
    for (let i = 1; i <= totalSeats; i++) {
        const seat = document.createElement('button');
        seat.className = 'seat';
        seat.textContent = i;
        
        if (bookedSeats.includes(i)) {
            seat.classList.add('booked');
        } else {
            seat.classList.add('available');
            seat.addEventListener('click', () => toggleSeat(i, seat));
        }
        
        seatsContainer.appendChild(seat);
    }
}

// Toggle Seat Selection
function toggleSeat(seatNumber, seatElement) {
    const index = selectedSeats.indexOf(seatNumber);
    if (index > -1) {
        selectedSeats.splice(index, 1);
        seatElement.classList.remove('selected');
        seatElement.classList.add('available');
    } else {
        selectedSeats.push(seatNumber);
        seatElement.classList.remove('available');
        seatElement.classList.add('selected');
    }
    updateBookingSummary();
}

// Update Booking Summary
function updateBookingSummary() {
    selectedSeatsDisplay.textContent = selectedSeats.length ? selectedSeats.join(', ') : 'None';
    const price = selectedSeats.length * 12;
    totalPrice.textContent = price.toFixed(2);
    confirmBtn.disabled = selectedSeats.length === 0;
}

// Confirm Booking
confirmBtn.addEventListener('click', async () => {
    if (selectedSeats.length === 0) return;
    
    const bookingData = {
        movieId: currentMovie._id,
        showtimeId: currentShowtime._id,
        seats: selectedSeats,
        totalPrice: selectedSeats.length * 12
    };
    
    try {
        const response = await fetch(`${API_URL}/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingData)
        });
        
        if (response.ok) {
            showNotification(`Booking confirmed! ${selectedSeats.length} seats booked.`);
            selectedSeats = [];
            showSection('movies');
            loadMovies();
        } else {
            const error = await response.json();
            showNotification(error.message || 'Booking failed', 'error');
        }
    } catch (error) {
        showNotification('Error making booking', 'error');
    }
});

// Load Bookings
async function loadBookings() {
    try {
        const response = await fetch(`${API_URL}/bookings`);
        const bookings = await response.json();
        renderBookings(bookings);
    } catch (error) {
        showNotification('Error loading bookings', 'error');
    }
}

// Render Bookings
function renderBookings(bookings) {
    bookingsList.innerHTML = bookings.map(booking => `
        <div class="booking-card">
            <h3>${booking.movie?.title || 'Unknown Movie'}</h3>
            <p>📅 ${booking.showtime?.time || 'Unknown Time'} | ${booking.showtime?.theater || 'Unknown Theater'}</p>
            <p>💺 Seats: ${booking.seats.join(', ')}</p>
            <p>💰 Total: $${booking.totalPrice.toFixed(2)}</p>
            <p style="font-size:12px;color:#999;">Booked: ${new Date(booking.createdAt).toLocaleString()}</p>
        </div>
    `).join('') || '<p style="text-align:center;color:#666;">No bookings yet.</p>';
}

// UI Helpers
function showSection(section) {
    moviesSection.style.display = 'none';
    showtimesSection.style.display = 'none';
    seatsSection.style.display = 'none';
    myBookingsSection.style.display = 'none';
    
    document.getElementById('homeBtn').classList.remove('active');
    document.getElementById('myBookingsBtn').classList.remove('active');
    
    if (section === 'movies') {
        moviesSection.style.display = 'block';
        document.getElementById('homeBtn').classList.add('active');
    } else if (section === 'showtimes') {
        showtimesSection.style.display = 'block';
    } else if (section === 'seats') {
        seatsSection.style.display = 'block';
    } else if (section === 'bookings') {
        myBookingsSection.style.display = 'block';
        document.getElementById('myBookingsBtn').classList.add('active');
    }
}

// Notification
function showNotification(message, type = 'success') {
    notification.textContent = message;
    notification.className = 'notification';
    if (type === 'error') notification.classList.add('error');
    notification.classList.add('show');
    setTimeout(() => notification.classList.remove('show'), 3000);
}

// Initialize
loadMovies();
