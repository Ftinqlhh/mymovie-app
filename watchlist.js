
const STORAGE_KEY = 'mymovie_watchlist';

const movieForm = document.getElementById('movieForm');
const movieTitle = document.getElementById('movieTitle');
const movieGenre = document.getElementById('movieGenre');
const movieRuntime = document.getElementById('movieRuntime');
const movieStatus = document.getElementById('movieStatus');

const watchlistContainer =
    document.getElementById('watchlistContainer');

const totalMovies = document.getElementById('totalMovies');
const totalWatchTime = document.getElementById('totalWatchTime');
const saveMovieBtn = document.getElementById('saveMovieBtn');

let editingId = null;

// READ: Retrieve saved movies
function getWatchlist() {
    try {
        const data = JSON.parse(
            localStorage.getItem(STORAGE_KEY) || '[]'
        );

        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Storage error:', error);
        return [];
    }
}

// SAVE: Persist movies
function saveWatchlist(movies) {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(movies)
    );
}

// DISPLAY: Render watchlist
function displayWatchlist() {
    const movies = getWatchlist();

    watchlistContainer.replaceChildren();

    if (movies.length === 0) {
        const message = document.createElement('p');
        message.className = 'empty-message';
        message.textContent =
            'Your watchlist is empty. Add a movie to get started.';

        watchlistContainer.appendChild(message);
    }

    movies.forEach(movie => {
        const card = document.createElement('div');
        card.className = 'movie-card';

        if (movie.poster) {
            const poster = document.createElement('img');
            poster.src =
                `https://image.tmdb.org/t/p/w500${movie.poster}`;
            poster.alt = movie.title;
            card.appendChild(poster);
        }

        const title = document.createElement('h3');
        title.textContent = movie.title;

        const genre = document.createElement('p');
        genre.textContent =
            `Genre: ${movie.genre || 'Not specified'}`;

        const runtime = document.createElement('p');
        runtime.textContent =
            `Runtime: ${movie.runtime || 0} minutes`;

        const status = document.createElement('p');
        status.textContent =
            `Status: ${movie.status || 'Plan to Watch'}`;

        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.addEventListener('click', () => {
            editMovie(movie.id);
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => {
            deleteMovie(movie.id);
        });
        // Button styling
        editBtn.classList.add('edit-btn');
        deleteBtn.classList.add('delete-btn');

        // Place buttons side by side
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'movie-actions';

        buttonContainer.appendChild(editBtn);
        buttonContainer.appendChild(deleteBtn);

        card.appendChild(title);
        card.appendChild(genre);
        card.appendChild(runtime);
        card.appendChild(status);
        card.appendChild(buttonContainer);

        watchlistContainer.appendChild(card);
    });

    updateStatistics(movies);
}

// CREATE & UPDATE: Save form data
movieForm.addEventListener('submit', event => {
    event.preventDefault();

    const title = movieTitle.value.trim();
    const genre = movieGenre.value;
    const runtime = Number(movieRuntime.value);
    const status = movieStatus.value;

    if (!title || !genre ||
        !Number.isInteger(runtime) || runtime <= 0) {
        alert('Please enter valid movie details and runtime.');
        return;
    }

    const movies = getWatchlist();

    if (editingId !== null) {
        const index = movies.findIndex(
            movie => movie.id === editingId
        );

        if (index !== -1) {
            movies[index] = {
                ...movies[index],
                title,
                genre,
                runtime,
                status
            };
        }

        editingId = null;
        saveMovieBtn.textContent = 'Save Movie';

    } else {
        const duplicate = movies.some(
            movie => movie.title.toLowerCase() ===
                title.toLowerCase()
        );

        if (duplicate) {
            alert('This movie is already in your watchlist!');
            return;
        }

        movies.push({
            id: crypto.randomUUID(),
            title,
            genre,
            runtime,
            status,
            poster: null
        });
    }

    try {
        saveWatchlist(movies);
        movieForm.reset();
        displayWatchlist();
        alert('Watchlist saved successfully!');
    } catch (error) {
        console.error(error);
        alert('Unable to save watchlist.');
    }
});

// UPDATE: Fill form with existing data
function editMovie(id) {
    const movie = getWatchlist().find(
        item => item.id === id
    );

    if (!movie) return;

    editingId = id;

    movieTitle.value = movie.title;
    movieGenre.value = movie.genre || '';
    movieRuntime.value = movie.runtime || '';
    movieStatus.value = movie.status || 'Plan to Watch';

    saveMovieBtn.textContent = 'Update Movie';

    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// DELETE: Remove movie
function deleteMovie(id) {
    if (!confirm('Delete this movie from your watchlist?')) {
        return;
    }

    const movies = getWatchlist().filter(
        movie => movie.id !== id
    );

    try {
        saveWatchlist(movies);
        displayWatchlist();
    } catch (error) {
        alert('Unable to delete movie.');
    }
}

// CALCULATION: Total watch time
function updateStatistics(movies) {
    totalMovies.textContent = movies.length;

    const totalMinutes = movies.reduce(
        (sum, movie) => sum + (Number(movie.runtime) || 0),
        0
    );

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    totalWatchTime.textContent =
        `${hours} hours ${minutes} minutes`;
}

// Load saved data when page opens
displayWatchlist();
