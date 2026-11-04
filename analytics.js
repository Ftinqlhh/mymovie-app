
const STORAGE_KEY = 'mymovie_watchlist';

// Retrieve watchlist from Local Storage
function getAnalyticsMovies() {
    try {
        const data = JSON.parse(
            localStorage.getItem(STORAGE_KEY) || '[]'
        );

        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Unable to read watchlist:', error);
        return [];
    }
}

// Calculate and display analytics
function updateAnalytics() {
    const movies = getAnalyticsMovies();

    // Total movies
    const total = movies.length;

    // Movies watched
    const watched = movies.filter(
        movie => movie.status === 'Watched'
    ).length;

    // Movies planned
    const planned = movies.filter(
        movie => movie.status !== 'Watched'
    ).length;

    // Total runtime
    const totalMinutes = movies.reduce(
        (sum, movie) => sum + (Number(movie.runtime) || 0),
        0
    );

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    // Watch progress calculation
    const progress = total > 0
        ? Math.round((watched / total) * 100)
        : 0;

    // Update statistics cards
    document.getElementById('analyticsTotal').textContent =
        total;

    document.getElementById('analyticsWatched').textContent =
        watched;

    document.getElementById('analyticsPlanned').textContent =
        planned;

    document.getElementById('analyticsRuntime').textContent =
        `${hours}h ${minutes}m`;

    // Update progress section
    document.getElementById('progressText').textContent =
        `${watched} of ${total} movies watched`;

    document.getElementById('progressPercent').textContent =
        `${progress}%`;

    document.getElementById('progressBar').style.width =
        `${progress}%`;

    // Update genre chart
    displayGenreChart(movies);
}

// Generate genre distribution
function displayGenreChart(movies) {
    const chart = document.getElementById('genreChart');
    chart.replaceChildren();

    if (movies.length === 0) {
        chart.textContent = 'No movies in your watchlist yet.';
        return;
    }

    const genreCounts = {};

    movies.forEach(movie => {
        const genre = movie.genre || 'Unknown';

        genreCounts[genre] = (genreCounts[genre] || 0) + 1;
    });

    const total = movies.length;

    Object.entries(genreCounts).forEach(([genre, count]) => {
        const percentage = (count / total) * 100;

        const item = document.createElement('div');
        item.className = 'genre-item';

        const label = document.createElement('div');
        label.className = 'genre-label';

        const genreName = document.createElement('span');
        genreName.textContent = genre;

        const genreCount = document.createElement('span');
        genreCount.textContent =
            `${count} movie(s) - ${percentage.toFixed(0)}%`;

        label.appendChild(genreName);
        label.appendChild(genreCount);

        const track = document.createElement('div');
        track.className = 'genre-track';

        const fill = document.createElement('div');
        fill.className = 'genre-fill';
        fill.style.width = `${percentage}%`;

        track.appendChild(fill);
        item.appendChild(label);
        item.appendChild(track);

        chart.appendChild(item);
    });
}

// Display dashboard on page load
updateAnalytics();
