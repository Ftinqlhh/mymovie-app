
const params = new URLSearchParams(window.location.search);
const movieId = Number(params.get('id'));

const loadingMessage =
    document.getElementById('detailsLoading');

const detailsContent =
    document.getElementById('detailsContent');

let currentMovie = null;

// Load full movie details
async function loadMovieDetails() {
    if (!Number.isSafeInteger(movieId) || movieId <= 0) {
        loadingMessage.textContent =
            'Invalid movie ID. Please return to Discover.';
        return;
    }

    try {
        const movie =
            await window.movieAPI.getFullMovieDetails(movieId);

        currentMovie = movie;

        document.getElementById('detailsTitle').textContent =
            movie.title || 'Unknown Title';

        document.getElementById('detailsOverview').textContent =
            movie.overview || 'No synopsis available.';

        document.getElementById('detailsDirector').textContent =
            movie.director || 'N/A';

        document.getElementById('detailsGenres').textContent =
            movie.genres.map(genre => genre.name).join(', ') || 'N/A';

        document.getElementById('detailsRelease').textContent =
            movie.release_date || 'N/A';

        document.getElementById('detailsRuntime').textContent =
            movie.runtime
                ? `${movie.runtime} minutes`
                : 'N/A';

        document.getElementById('detailsRating').textContent =
            `${Number(movie.vote_average || 0).toFixed(1)}/10`;

        // Movie metadata
        const meta = document.getElementById('detailsMeta');
        meta.replaceChildren();

        [
            movie.release_date?.slice(0, 4) || 'N/A',
            movie.genres[0]?.name || 'Unknown Genre',
            movie.runtime ? `${movie.runtime} min` : 'N/A',
            `${Number(movie.vote_average || 0).toFixed(1)}/10`
        ].forEach(value => {
            const span = document.createElement('span');
            span.textContent = value;
            meta.appendChild(span);
        });

        // Poster
        const poster = document.getElementById('detailsPoster');

        if (movie.poster_path) {
            poster.src =
                `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
            poster.alt = `${movie.title} poster`;
        } else {
            poster.style.display = 'none';
        }

        // Backdrop
        if (movie.backdrop_path) {
            document.getElementById('detailsHero')
                .style.backgroundImage =
                `linear-gradient(90deg, #09090f 5%, rgba(9,9,15,.88) 45%, rgba(9,9,15,.45) 100%), url("https://image.tmdb.org/t/p/original${movie.backdrop_path}")`;
        }

        // Cast
        const castContainer =
            document.getElementById('detailsCast');

        castContainer.replaceChildren();

        const cast = movie.cast || [];

        if (cast.length === 0) {
            castContainer.textContent =
                'Cast information is unavailable.';
        }

        cast.slice(0, 6).forEach(person => {
            const card = document.createElement('div');
            card.className = 'cast-card';

            if (person.profile_path) {
                const image = document.createElement('img');
                image.src =
                    `https://image.tmdb.org/t/p/w185${person.profile_path}`;
                image.alt = person.name;
                card.appendChild(image);
            }

            const name = document.createElement('strong');
            name.textContent = person.name;

            const character = document.createElement('p');
            character.textContent =
                person.character || 'Cast member';

            card.appendChild(name);
            card.appendChild(character);
            castContainer.appendChild(card);
        });

        loadingMessage.hidden = true;
        detailsContent.hidden = false;

    } catch (error) {
        console.error('Movie details error:', error);
        loadingMessage.textContent =
            'Unable to load movie details. Please try again.';
    }
}

// Add selected movie to watchlist
document.getElementById('detailsAddBtn')
    .addEventListener('click', () => {
        if (!currentMovie) return;

        try {
            const watchlist = JSON.parse(
                localStorage.getItem('mymovie_watchlist') || '[]'
            );

            if (watchlist.some(item => item.id === currentMovie.id)) {
                alert('This movie is already in your watchlist!');
                return;
            }

            const runtime = Number(currentMovie.runtime);

            if (!Number.isInteger(runtime) || runtime <= 0) {
                alert('Runtime is unavailable for this movie.');
                return;
            }

            watchlist.push({
                id: currentMovie.id,
                title: currentMovie.title,
                poster: currentMovie.poster_path,
                releaseDate: currentMovie.release_date,
                rating: currentMovie.vote_average,
                overview: currentMovie.overview,
                genreIds: currentMovie.genres.map(genre => genre.id),
                genre: currentMovie.genres[0]?.name || '',
                runtime,
                status: 'Plan to Watch'
            });

            localStorage.setItem(
                'mymovie_watchlist',
                JSON.stringify(watchlist)
            );

            alert(`${currentMovie.title} added to your watchlist!`);

        } catch (error) {
            console.error(error);
            alert('Unable to save movie.');
        }
    });

// Return to Discover Movies
document.getElementById('detailsBackBtn')
    .addEventListener('click', () => {
        window.location.href = 'index.html';
    });

loadMovieDetails();
