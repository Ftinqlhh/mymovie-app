require('dotenv').config();

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// Create the main application window
function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 900,
        minHeight: 600,

        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    mainWindow.loadFile('index.html');
}

// Get TMDB token from .env file
function getToken() {
    const token = process.env.TMDB_TOKEN;

    if (!token) {
        throw new Error('TMDB token is missing.');
    }
    return token;
}

// Request movie data from TMDB
async function getTMDBData(url) {
    const token = getToken();

    const response = await fetch(url, {
        headers: {
            Authorization: 'Bearer ' + token,
            accept: 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error('TMDB request failed: ' + response.status);
    }

    const data = await response.json();
    return data;
}

// Search movies by title
async function searchMovies(event, title) {

    // Check movie title
    if (typeof title !== 'string' || title.trim() === '') {
        throw new Error('Please enter a movie title.');
    }

    // Prepare TMDB search URL
    const url = new URL('https://api.themoviedb.org/3/search/movie');

    url.searchParams.set('query', title.trim());
    url.searchParams.set('language', 'en-US');

    // Get search results
    const data = await getTMDBData(url);

    return data.results || [];
}

// Discover movies based on genre
async function discoverMovies(event, genreId) {

    // List of available genres
    const allowedGenres = [
        '28',     // Action
        '35',     // Comedy
        '18',     // Drama
        '27',     // Horror
        '10749',  // Romance
        '878',    // Science Fiction
        '16'      // Animation
    ];

    // Check selected genre
    if (genreId && !allowedGenres.includes(genreId)) {
        throw new Error('Invalid movie genre.');
    }

    // Prepare TMDB discover URL
    const url = new URL('https://api.themoviedb.org/3/discover/movie');

    url.searchParams.set('language', 'en-US');
    url.searchParams.set('sort_by', 'popularity.desc');

    if (genreId) {
        url.searchParams.set('with_genres', genreId);
    }

    // Get discovered movies
    const data = await getTMDBData(url);

    return data.results || [];
}

// Get movie runtime and genre
async function getMovieDetails(event, movieId) {

    // Check movie ID
    if (!Number.isSafeInteger(movieId) || movieId <= 0) {
        throw new Error('Invalid movie ID.');
    }

    // Prepare movie details URL
    const url = new URL(
        'https://api.themoviedb.org/3/movie/' + movieId
    );

    url.searchParams.set('language', 'en-US');

    // Get movie information
    const data = await getTMDBData(url);

    // Get first genre
    let genre = '';

    if (data.genres && data.genres.length > 0) {
        genre = data.genres[0].name;
    }

    return {
        runtime: data.runtime,
        genre: genre
    };
}

// Get full movie information
async function getFullMovieDetails(event, movieId) {

    // Check movie ID
    if (!Number.isSafeInteger(movieId) || movieId <= 0) {
        throw new Error('Invalid movie ID.');
    }

    // Prepare full details URL
    const url = new URL(
        'https://api.themoviedb.org/3/movie/' + movieId
    );

    url.searchParams.set('language', 'en-US');
    url.searchParams.set('append_to_response', 'credits');

    // Get full movie information
    const data = await getTMDBData(url);

    // Find the movie director
    let directorName = 'N/A';

    if (data.credits && data.credits.crew) {
        for (let person of data.credits.crew) {
            if (person.job === 'Director') {
                directorName = person.name;
                break;
            }
        }
    }

    // Get a maximum of 8 cast members
    const cast = [];

    if (data.credits && data.credits.cast) {
        for (let person of data.credits.cast) {

            if (cast.length >= 6) {
                break;
            }

            const castMember = {
                name: person.name,
                character: person.character,
                profile_path: person.profile_path
            };

            cast.push(castMember);
        }
    }

    // Return movie information to renderer
    return {
        id: data.id,
        title: data.title,
        overview: data.overview,
        poster_path: data.poster_path,
        backdrop_path: data.backdrop_path,
        release_date: data.release_date,
        vote_average: data.vote_average,
        runtime: data.runtime,
        genres: data.genres || [],
        director: directorName,
        cast: cast
    };
}

// Start Electron application
app.whenReady().then(function () {

    // Connect renderer requests to TMDB functions
    ipcMain.handle('tmdb:search', searchMovies);
    ipcMain.handle('tmdb:discover', discoverMovies);
    ipcMain.handle('tmdb:details', getMovieDetails);
    ipcMain.handle('tmdb:fullDetails', getFullMovieDetails);

    // Open main window
    createWindow();

    // Reopen window on macOS
    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Close application when all windows are closed
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});