const STORAGE_KEY = 'mymovie_watchlist';

// Get elements from HTML
const movieForm = document.getElementById('movieForm');
const movieTitle = document.getElementById('movieTitle');
const movieGenre = document.getElementById('movieGenre');
const movieRuntime = document.getElementById('movieRuntime');
const movieStatus = document.getElementById('movieStatus');
const saveMovieBtn = document.getElementById('saveMovieBtn');

const watchlistContainer = document.getElementById('watchlistContainer');

// STATISTICS
const totalMovies = document.getElementById('totalMovies');
const watchedMovies = document.getElementById('watchedMovies');
const plannedMovies = document.getElementById('plannedMovies');
const totalWatchTime = document.getElementById('totalWatchTime');
const watchProgressText = document.getElementById('watchProgressText');
const watchProgressBar = document.getElementById('watchProgressBar');
const watchProgressPercent = document.getElementById('watchProgressPercent');

let editingId = null;
//CRUD : CREATE
// GET MOVIE FROM LOCALSTORAGE
function getWatchlist() {
    try {
        const movies = JSON.parse(
            localStorage.getItem(STORAGE_KEY) || '[]'
        );

        if (Array.isArray(movies)) {
            return movies;
        }

        return [];
    } catch (error) {
        console.error('Error loading movies:', error);
        return [];
    }
}

// Save movies to localStorage
function saveWatchlist(movies) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(movies));
}

//CRUD : READ
// Show saved movies on the page
function displayWatchlist() {
    const movies = getWatchlist();

    watchlistContainer.innerHTML = '';

    if (movies.length === 0) {
        const message = document.createElement('p');
        message.textContent = 'Your watchlist is empty. Add a movie to get started.';
        watchlistContainer.appendChild(message);
    }

    for (let movie of movies) {
        const card = document.createElement('div');
        card.className = 'movie-card';

        // Show poster if available
        if (movie.poster) {
            const poster = document.createElement('img');
            poster.src = `https://image.tmdb.org/t/p/w500${movie.poster}`;
            poster.alt = movie.title;
            poster.loading = 'lazy';
            card.appendChild(poster);
        }

        const title = document.createElement('h3');
        title.textContent = movie.title || 'Untitled Movie';

        const genre = document.createElement('p');
        genre.textContent = 'Genre: ' + (movie.genre || 'Not specified');

        const runtime = document.createElement('p');
        runtime.textContent = 'Runtime: ' + (movie.runtime || 0) + ' minutes';

        const status = document.createElement('p');
        status.textContent = 'Status: ' + (movie.status || 'Plan to Watch');

        // Edit button
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.className = 'edit-btn';
        editBtn.addEventListener('click', function () {
            editMovie(movie.id);
        });

        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.className = 'delete-btn';
        deleteBtn.addEventListener('click', function () {
            deleteMovie(movie.id);
        });

        const buttons = document.createElement('div');
        buttons.className = 'movie-actions';
        buttons.appendChild(editBtn);
        buttons.appendChild(deleteBtn);

        card.appendChild(title);
        card.appendChild(genre);
        card.appendChild(runtime);
        card.appendChild(status);
        card.appendChild(buttons);

        watchlistContainer.appendChild(card);
    }

    updateStatistics(movies);
}

//CRUD : CREATE
// Add or update a movie
movieForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const title = movieTitle.value.trim();
    const genre = movieGenre.value;
    const runtime = Number(movieRuntime.value);
    const status = movieStatus.value;

    if (!title || !genre || !Number.isInteger(runtime) || runtime <= 0) {
        alert('Please enter valid movie details and runtime.');
        return;
    }

    const movies = getWatchlist();

    if (editingId !== null) {
        // Update existing movie
        const index = movies.findIndex(function (movie) {
            return movie.id === editingId;
        });

        if (index === -1) {
            alert('Movie not found.');
            editingId = null;
            saveMovieBtn.textContent = 'Save Movie';
            return;
        }

        movies[index].title = title;
        movies[index].genre = genre;
        movies[index].runtime = runtime;
        movies[index].status = status;

    } else {
        // Check if movie already exists
        let duplicate = false;

        for (let movie of movies) {
            if (String(movie.title || '').toLowerCase() === title.toLowerCase()) {
                duplicate = true;
                break;
            }
        }

        if (duplicate) {
            alert('This movie is already in your watchlist!');
            return;
        }

        // Add new movie
        const newMovie = {
            id: crypto.randomUUID(),
            title: title,
            genre: genre,
            runtime: runtime,
            status: status,
            poster: null
        };

        movies.push(newMovie);
    }

    try {
        saveWatchlist(movies);

        editingId = null;
        saveMovieBtn.textContent = 'Save Movie';
        movieForm.reset();

        displayWatchlist();
        alert('Watchlist saved successfully!');
    } catch (error) {
        console.error('Error saving movie:', error);
        alert('Unable to save watchlist.');
    }
});


// CRUD : UPDATE, Edit a saved movie
function editMovie(id) {
    const movies = getWatchlist();
    let selectedMovie = null;

    for (let movie of movies) {
        if (movie.id === id) {
            selectedMovie = movie;
            break;
        }
    }

    if (selectedMovie === null) {
        alert('Movie not found.');
        return;
    }

    editingId = id;

    movieTitle.value = selectedMovie.title || '';
    movieGenre.value = selectedMovie.genre || '';
    movieRuntime.value = selectedMovie.runtime || '';
    movieStatus.value = selectedMovie.status || 'Plan to Watch';

    saveMovieBtn.textContent = 'Update Movie';

    movieForm.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}


// CRUD : DELETE, Delete a movie
function deleteMovie(id) {
    if (!confirm('Delete this movie from your watchlist?')) {
        return;
    }

    const movies = getWatchlist();
    const updatedMovies = [];

    for (let movie of movies) {
        if (movie.id !== id) {
            updatedMovies.push(movie);
        }
    }

    try {
        saveWatchlist(updatedMovies);

        if (editingId === id) {
            editingId = null;
            movieForm.reset();
            saveMovieBtn.textContent = 'Save Movie';
        }

        displayWatchlist();
    } catch (error) {
        console.error('Error deleting movie:', error);
        alert('Unable to delete movie.');
    }
}


// Calculate watchlist statistics
function updateStatistics(movies) {
    const total = movies.length;

    let watched = 0;
    let planned = 0;
    let totalMinutes = 0;

    for (let movie of movies) {
        if (movie.status === 'Watched') {
            watched++;
        } else {
            planned++;
        }

        const runtime = Number(movie.runtime);

        if (Number.isFinite(runtime) && runtime > 0) {
            totalMinutes += runtime;
        }
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    let progress = 0;

    if (total > 0) {
        progress = Math.round((watched / total) * 100);
    }

    totalMovies.textContent = total;
    watchedMovies.textContent = watched;
    plannedMovies.textContent = planned;
    totalWatchTime.textContent = hours + 'h ' + minutes + 'm';

    watchProgressText.textContent = watched + ' of ' + total + ' movies watched';
    watchProgressPercent.textContent = progress + '%';
    watchProgressBar.style.width = progress + '%';
}


// Load movies when the page opens
displayWatchlist();