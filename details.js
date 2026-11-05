
const params = new URLSearchParams(window.location.search);
const movieId = Number(params.get('id'));
const loadingMessage = document.getElementById('detailsLoading');
const detailsContent = document.getElementById('detailsContent');

let currentMovie = null;

// LOAD MOVIE INFORMATION FROM TMDB
async function loadMovieDetails() {

    // Check if movie ID is valid
    if (!Number.isSafeInteger(movieId) || movieId <= 0) {
        loadingMessage.textContent = 'Invalid movie ID. Please return to Discover.';
        return;
    }
    try {
        // Get full movie details
        const movie = await window.movieAPI.getFullMovieDetails(movieId);
        currentMovie = movie;
        // Display movie title and synopsis
        document.getElementById('detailsTitle').textContent =
            movie.title || 'Unknown Title';

        document.getElementById('detailsOverview').textContent =
            movie.overview || 'No synopsis available.';

        document.getElementById('detailsDirector').textContent =
            movie.director || 'N/A';

        // Get movie genres
        const genreNames = [];

        for (let genre of movie.genres) {
            genreNames.push(genre.name);
        }

        document.getElementById('detailsGenres').textContent =
            genreNames.join(', ') || 'N/A';

        // Display release date
        document.getElementById('detailsRelease').textContent =
            movie.release_date || 'N/A';

        // Display runtime
        if (movie.runtime) {
            document.getElementById('detailsRuntime').textContent =
                movie.runtime + ' minutes';
        } else {
            document.getElementById('detailsRuntime').textContent = 'N/A';
        }

        // Display rating
        const rating = Number(movie.vote_average || 0).toFixed(1);

        document.getElementById('detailsRating').textContent =
            rating + '/10';

        // Display short movie information
        const meta = document.getElementById('detailsMeta');
        meta.replaceChildren();

        let releaseYear = 'N/A';
        let firstGenre = 'Unknown Genre';
        let shortRuntime = 'N/A';

        if (movie.release_date) {
            releaseYear = movie.release_date.slice(0, 4);
        }

        if (movie.genres.length > 0) {
            firstGenre = movie.genres[0].name;
        }

        if (movie.runtime) {
            shortRuntime = movie.runtime + ' min';
        }

        const metaValues = [
            releaseYear,
            firstGenre,
            shortRuntime,
            rating + '/10'
        ];

        for (let value of metaValues) {
            const span = document.createElement('span');
            span.textContent = value;
            meta.appendChild(span);
        }

        // Display movie poster
        const poster = document.getElementById('detailsPoster');

        if (movie.poster_path) {
            poster.src = 'https://image.tmdb.org/t/p/w500' + movie.poster_path;
            poster.alt = movie.title + ' poster';
        } else {
            poster.style.display = 'none';
        }

        // Display movie backdrop
        if (movie.backdrop_path) {
            const hero = document.getElementById('detailsHero');

            hero.style.backgroundImage =
                'linear-gradient(90deg, #09090f 5%, rgba(9,9,15,.88) 45%, rgba(9,9,15,.45) 100%), ' +
                'url("https://image.tmdb.org/t/p/original' + movie.backdrop_path + '")';
        }

       // Display movie cast
        const castContainer = document.getElementById('detailsCast');
        castContainer.replaceChildren();

        const cast = movie.cast || [];
        console.log('Total cast received:', cast.length);

        if (cast.length === 0) {
            castContainer.textContent = 'Cast information is unavailable.';
        }

        // Show a maximum of 6 cast members
        let castCount = 0;

        for (let person of cast) {
            if (castCount >= 6) {
                break;
            }

            const card = document.createElement('div');
            card.className = 'cast-card';

            // Cast profile picture
            if (person.profile_path) {
                const image = document.createElement('img');
                image.src = 'https://image.tmdb.org/t/p/w185' + person.profile_path;
                image.alt = person.name;
                card.appendChild(image);
            }

            // Cast name
            const name = document.createElement('strong');
            name.textContent = person.name;

            // Character name
            const character = document.createElement('p');
            character.textContent = person.character || 'Cast member';

            card.appendChild(name);
            card.appendChild(character);
            castContainer.appendChild(card);

            castCount++;
        }

        // Show details after loading
        loadingMessage.hidden = true;
        detailsContent.hidden = false;

    } catch (error) {
        console.error('Movie details error:', error);
        loadingMessage.textContent =
            'Unable to load movie details. Please try again.';
    }
}

// ADD MOVIES TO WATCHLIST
function addMovieToWatchlist() {

    if (currentMovie === null) {
        return;
    }

    try {
        // Get saved movies
        const watchlist = JSON.parse(
            localStorage.getItem('mymovie_watchlist') || '[]'
        );

        // Check for duplicate movie
        let exists = false;

        for (let movie of watchlist) {
            if (movie.id === currentMovie.id) {
                exists = true;
                break;
            }
        }

        if (exists) {
            alert('This movie is already in your watchlist!');
            return;
        }

        // Check movie runtime
        const runtime = Number(currentMovie.runtime);

        if (!Number.isInteger(runtime) || runtime <= 0) {
            alert('Runtime is unavailable for this movie.');
            return;
        }

        // Get genre IDs
        const genreIds = [];

        for (let genre of currentMovie.genres) {
            genreIds.push(genre.id);
        }

        let firstGenre = '';

        if (currentMovie.genres.length > 0) {
            firstGenre = currentMovie.genres[0].name;
        }

        // Create movie object
        const savedMovie = {
            id: currentMovie.id,
            title: currentMovie.title,
            poster: currentMovie.poster_path,
            releaseDate: currentMovie.release_date,
            rating: currentMovie.vote_average,
            overview: currentMovie.overview,
            genreIds: genreIds,
            genre: firstGenre,
            runtime: runtime,
            status: 'Plan to Watch'
        };

        // Save movie to localStorage
        watchlist.push(savedMovie);

        localStorage.setItem(
            'mymovie_watchlist',
            JSON.stringify(watchlist)
        );

        alert(currentMovie.title + ' added to your watchlist!');

    } catch (error) {
        console.error('Unable to save movie:', error);
        alert('Unable to save movie.');
    }
}

// Add to Watchlist button
const addBtn = document.getElementById('detailsAddBtn');

addBtn.addEventListener('click', function () {
    addMovieToWatchlist();
});

// Back to Discover button
const backBtn = document.getElementById('detailsBackBtn');

backBtn.addEventListener('click', function () {
    window.location.href = 'index.html';
});

// Load movie details when page opens
loadMovieDetails();
