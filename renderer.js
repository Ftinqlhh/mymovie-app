
const searchInput = document.getElementById('searchMovie');
const searchBtn = document.getElementById('searchBtn');
const movieResults = document.getElementById('movieResults');

const genreSelect = document.getElementById('genreSelect');
const recommendBtn = document.getElementById('recommendBtn');

// Search movies by title
async function searchMovies() {
    const title = searchInput.value.trim();

    if (title === '') {
        movieResults.innerHTML = '<p class="empty-message">Please enter a movie title.</p>';
        return;
    }

    movieResults.innerHTML = '<p class="empty-message">Searching for movies...</p>';
    searchBtn.disabled = true;

    try {
        // Get search results from TMDB
        const movies = await window.movieAPI.searchMovies(title);

        if (movies.length === 0) {
            movieResults.innerHTML = '<p class="empty-message">No movies found. Try another title.</p>';
            return;
        }

        displayMovies(movies);

    } catch (error) {
        console.error('Movie search error:', error);
        movieResults.innerHTML = '<p class="empty-message">Unable to load movies. Please check your internet connection or API configuration.</p>';

    } finally {
        searchBtn.disabled = false;
    }
}


// Display movie cards
function displayMovies(movies) {
    movieResults.replaceChildren();

    for (let movie of movies) {
        const card = document.createElement('div');
        card.className = 'movie-card';

        // Movie poster
        if (movie.poster_path) {
            const poster = document.createElement('img');
            poster.src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
            poster.alt = movie.title || 'Movie poster';
            card.appendChild(poster);
        }

        // Movie title
        const title = document.createElement('h3');
        title.textContent = movie.title || 'Unknown Title';

        // Release date
        const release = document.createElement('p');
        release.textContent = 'Release Date: ' + (movie.release_date || 'N/A');

        // Movie rating
        const rating = document.createElement('p');
        rating.textContent = 'Rating: ' + Number(movie.vote_average || 0).toFixed(1) + '/10';

        // Movie synopsis
        const overview = document.createElement('p');
        overview.textContent = movie.overview || 'No synopsis available.';
        overview.className = 'movie-overview';

        card.appendChild(title);
        card.appendChild(release);
        card.appendChild(rating);
        card.appendChild(overview);

        // Add to Watchlist button
        const addBtn = document.createElement('button');
        addBtn.textContent = '+ Add to Watchlist';

        addBtn.addEventListener('click', function () {
            addToWatchlist(movie);
        });

        card.appendChild(addBtn);

        // View Details button
        const detailsBtn = document.createElement('button');
        detailsBtn.textContent = 'View Details';
        detailsBtn.className = 'view-details-btn';

        detailsBtn.addEventListener('click', function () {
            window.location.href = 'details.html?id=' + movie.id;
        });

        card.appendChild(detailsBtn);
        movieResults.appendChild(card);
    }
}

// Search when button is clicked
searchBtn.addEventListener('click', searchMovies);

// Search when Enter is pressed
searchInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        searchMovies();
    }
});

// Recommend movies based on selected genre
async function recommendMovies() {
    const selectedGenre = genreSelect.value;
    let genreId = '';

    // Check selected genre
    if (selectedGenre === '28') {
        genreId = '28'; // Action
    } else if (selectedGenre === '35') {
        genreId = '35'; // Comedy
    } else if (selectedGenre === '18') {
        genreId = '18'; // Drama
    } else if (selectedGenre === '27') {
        genreId = '27'; // Horror
    } else if (selectedGenre === '10749') {
        genreId = '10749'; // Romance
    } else if (selectedGenre === '878') {
        genreId = '878'; // Science Fiction
    } else if (selectedGenre === '16') {
        genreId = '16'; // Animation
    }

    movieResults.innerHTML = '<p class="empty-message">Finding movies for you...</p>';
    recommendBtn.disabled = true;

    try {
        const movies = await window.movieAPI.discoverMovies(genreId);

        if (movies.length === 0) {
            movieResults.innerHTML = '<p class="empty-message">No recommendations found. Try another genre.</p>';
            return;
        }

        let minimumRating;
        let genreName;

        // Set minimum rating for each genre
        switch (selectedGenre) {
            case '28':
                minimumRating = 6.5;
                genreName = 'Action';
                break;

            case '35':
                minimumRating = 6.0;
                genreName = 'Comedy';
                break;

            case '18':
                minimumRating = 7.0;
                genreName = 'Drama';
                break;

            case '27':
                minimumRating = 5.5;
                genreName = 'Horror';
                break;

            case '10749':
                minimumRating = 6.5;
                genreName = 'Romance';
                break;

            case '878':
                minimumRating = 6.5;
                genreName = 'Science Fiction';
                break;

            case '16':
                minimumRating = 6.5;
                genreName = 'Animation';
                break;

            default:
                minimumRating = 6.0;
                genreName = 'All Genres';
        }

        // Filter movies by minimum rating
        const recommendedMovies = [];

        for (let movie of movies) {
            if (Number(movie.vote_average) >= minimumRating) {
                recommendedMovies.push(movie);
            }
        }

        // Sort movies from highest to lowest rating
        recommendedMovies.sort(function (a, b) {
            return Number(b.vote_average) - Number(a.vote_average);
        });

        if (recommendedMovies.length === 0) {
            displayMovies(movies);

            const message = document.createElement('p');
            message.className = 'empty-message';
            message.textContent =
                'No ' + genreName + ' movies met the minimum rating of ' +
                minimumRating + '/10. Showing available movies instead.';

            movieResults.prepend(message);
        } else {
            displayMovies(recommendedMovies);
        }

    } catch (error) {
        console.error('Recommendation error:', error);
        movieResults.innerHTML = '<p class="empty-message">Unable to load recommendations. Please try again.</p>';

    } finally {
        recommendBtn.disabled = false;
    }
}


// Recommend when button is clicked
recommendBtn.addEventListener('click', recommendMovies);

// Add selected movie to Watchlist
async function addToWatchlist(movie) {
    try {
        const watchlist = JSON.parse(
            localStorage.getItem('mymovie_watchlist') || '[]'
        );

        // Check if movie is already saved
        let exists = false;

        for (let item of watchlist) {
            if (item.id === movie.id) {
                exists = true;
                break;
            }
        }

        if (exists) {
            alert('This movie is already in your watchlist!');
            return;
        }

        // Get movie runtime from TMDB
        const details = await window.movieAPI.getMovieDetails(movie.id);
        const runtime = Number(details.runtime);

        if (!Number.isInteger(runtime) || runtime <= 0) {
            alert('Runtime is unavailable for this movie.');
            return;
        }

        // Save movie information
        const savedMovie = {
            id: movie.id,
            title: movie.title,
            poster: movie.poster_path,
            releaseDate: movie.release_date,
            rating: movie.vote_average,
            overview: movie.overview,
            genreIds: movie.genre_ids || [],
            genre: details.genre,
            runtime: runtime,
            status: 'Plan to Watch'
        };

        watchlist.push(savedMovie);

        localStorage.setItem(
            'mymovie_watchlist',
            JSON.stringify(watchlist)
        );

        alert(movie.title + ' added successfully!\nRuntime: ' + runtime + ' minutes');

    } catch (error) {
        console.error('Add to Watchlist Error:', error);
        alert('Unable to retrieve movie runtime.');
    }
}

// Load popular movies when the page opens
async function loadFeaturedMovies() {
    movieResults.innerHTML = '<p class="empty-message">Loading movies for you...</p>';

    try {
        const movies = await window.movieAPI.discoverMovies('');

        if (movies.length === 0) {
            movieResults.innerHTML = '<p class="empty-message">No movies available right now.</p>';
            return;
        }

        displayMovies(movies);
    } catch (error) {
        console.error('Featured movies error:', error);
        movieResults.innerHTML = '<p class="empty-message">Unable to load movies. Please check your internet connection.</p>';
    }
}
// Show movies automatically
loadFeaturedMovies();