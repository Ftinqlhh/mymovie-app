const searchInput = document.getElementById('searchMovie');
const searchBtn = document.getElementById('searchBtn');
const movieResults = document.getElementById('movieResults');

// Search movies from TMDB
async function searchMovies() {
    const title = searchInput.value.trim();

    // Input validation
    if (title === '') {
        movieResults.innerHTML =
            '<p class="empty-message">Please enter a movie title.</p>';
        return;
    }

    // Loading message
    movieResults.innerHTML =
        '<p class="empty-message">Searching for movies...</p>';

    searchBtn.disabled = true;

    try {
        // Request data through Electron preload
        const movies = await window.movieAPI.searchMovies(title);

        // No results found
        if (movies.length === 0) {
            movieResults.innerHTML =
                '<p class="empty-message">No movies found. Try another title.</p>';
            return;
        }

        displayMovies(movies);

    } catch (error) {
        console.error('Movie search error:', error);

        movieResults.innerHTML =
            '<p class="empty-message">Unable to load movies. Please check your internet connection or API configuration.</p>';

    } finally {
        searchBtn.disabled = false;
    }
}

// Display movie cards
function displayMovies(movies) {
    movieResults.replaceChildren();

    movies.forEach(movie => {
        const card = document.createElement('div');
        card.className = 'movie-card';

        const poster = document.createElement('img');

        poster.src = movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : '';

        poster.alt = movie.title || 'Movie poster';

        if (!movie.poster_path) {
            poster.style.display = 'none';
        }

        const title = document.createElement('h3');
        title.textContent = movie.title || 'Unknown Title';

        const release = document.createElement('p');
        release.textContent =
            `Release Date: ${movie.release_date || 'N/A'}`;

        const rating = document.createElement('p');
        rating.textContent =
            `Rating: ${Number(movie.vote_average || 0).toFixed(1)}/10`;

        const overview = document.createElement('p');
        overview.textContent =
            movie.overview || 'No synopsis available.';
            overview.className = 'movie-overview';

        card.appendChild(poster);
        card.appendChild(title);
        card.appendChild(release);
        card.appendChild(rating);
        card.appendChild(overview);
        // Add to Watchlist button
        const addBtn = document.createElement('button');
        addBtn.textContent = '+ Add to Watchlist';

        addBtn.addEventListener('click', () => {
            addToWatchlist(movie);
        });

        
        card.appendChild(addBtn);

        // View full movie information
        const detailsBtn = document.createElement('button');
        detailsBtn.textContent = 'View Details';
        detailsBtn.className = 'view-details-btn';

        detailsBtn.addEventListener('click', () => {
            window.location.href = `details.html?id=${movie.id}`;
        });

        card.appendChild(detailsBtn);

        movieResults.appendChild(card);

    });
}

// Search button event
searchBtn.addEventListener('click', searchMovies);

// Press Enter to search
searchInput.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
        searchMovies();
    }
});

const genreSelect = document.getElementById('genreSelect');
const recommendBtn = document.getElementById('recommendBtn');

async function recommendMovies() {
    const selectedGenre = genreSelect.value;

    // Student-written decision-making logic
    let genreId;

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
    } else {
        genreId = ''; // All Genres fallback
    }

    movieResults.innerHTML =
        '<p class="empty-message">Finding movies for you...</p>';

    recommendBtn.disabled = true;

    try {
        const movies =
            await window.movieAPI.discoverMovies(genreId);

        if (movies.length === 0) {
            movieResults.innerHTML =
                '<p class="empty-message">No recommendations found. Try another genre.</p>';
            return;
        }

        
        let minimumRating;
        let genreName;

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

    // Apply student-written recommendation criteria
    const recommendedMovies = movies
    .filter(movie =>
        Number(movie.vote_average) >= minimumRating
    )
    .sort((a, b) =>
        Number(b.vote_average) - Number(a.vote_average)
    );

    // Fallback when no movies meet the rating criteria
    
    if (recommendedMovies.length === 0) {
        // Display fallback movies
        displayMovies(movies);

        // Show fallback message above the movie cards
        const fallbackMessage = document.createElement('p');

        fallbackMessage.className = 'empty-message';

        fallbackMessage.textContent =
            `No ${genreName} movies met the minimum rating ` +
            `of ${minimumRating}/10. Showing available movies instead.`;

        movieResults.prepend(fallbackMessage);

    } else {
        // Display movies that meet the rating criteria
        displayMovies(recommendedMovies);
    }

    } catch (error) {
        console.error('Recommendation error:', error);

        movieResults.innerHTML =
            '<p class="empty-message">Unable to load recommendations. Please try again.</p>';

    } finally {
        recommendBtn.disabled = false;
    }
}

recommendBtn.addEventListener('click', recommendMovies);

// Save selected movie to Local Storage

async function addToWatchlist(movie) {
    try {
        const watchlist = JSON.parse(
            localStorage.getItem('mymovie_watchlist') || '[]'
        );

        // Check for duplicate movie
        const exists = watchlist.some(
            item => item.id === movie.id
        );

        if (exists) {
            alert('This movie is already in your watchlist!');
            return;
        }

        // Get actual runtime from TMDB
        const details = await window.movieAPI.getMovieDetails(
            movie.id
        );

        console.log('TMDB Movie Details:', details);

        const runtime = Number(details.runtime);

        if (!Number.isInteger(runtime) || runtime <= 0) {
            alert('Runtime is unavailable for this movie.');
            return;
        }

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

        alert(
            `${movie.title} added successfully!\nRuntime: ${runtime} minutes`
        );

    } catch (error) {
        console.error('Add to Watchlist Error:', error);
        alert('Unable to retrieve movie runtime.');
    }
}