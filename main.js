require('dotenv').config();

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// Create the Electron application window
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

// Start Electron when ready
app.whenReady().then(() => {

    // ======================================
    // 1. SEARCH MOVIES USING TMDB API
    // ======================================
    ipcMain.handle('tmdb:search', async (event, title) => {
        const token = process.env.TMDB_TOKEN;

        if (!token) {
            throw new Error('TMDB token is missing.');
        }

        if (typeof title !== 'string' || !title.trim()) {
            throw new Error('Please enter a movie title.');
        }

        const url = new URL(
            'https://api.themoviedb.org/3/search/movie'
        );

        url.searchParams.set('query', title.trim());
        url.searchParams.set('language', 'en-US');

        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`,
                accept: 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(
                `TMDB search failed: ${response.status}`
            );
        }

        const data = await response.json();

        return data.results || [];
    });

    // ======================================
    // 2. DISCOVER MOVIES BY GENRE
    // ======================================
    ipcMain.handle('tmdb:discover', async (event, genreId) => {
        const token = process.env.TMDB_TOKEN;

        if (!token) {
            throw new Error('TMDB token is missing.');
        }

        const allowedGenres = [
            '28', '35', '18', '27',
            '10749', '878', '16'
        ];

        if (genreId && !allowedGenres.includes(genreId)) {
            throw new Error('Invalid movie genre.');
        }

        const url = new URL(
            'https://api.themoviedb.org/3/discover/movie'
        );

        url.searchParams.set('language', 'en-US');
        url.searchParams.set('sort_by', 'popularity.desc');

        if (genreId) {
            url.searchParams.set('with_genres', genreId);
        }

        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`,
                accept: 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(
                `TMDB discover failed: ${response.status}`
            );
        }

        const data = await response.json();

        return data.results || [];
    });

    // ======================================
    // 3. GET MOVIE DETAILS AND RUNTIME
    // ======================================
    ipcMain.handle('tmdb:details', async (event, movieId) => {
        const token = process.env.TMDB_TOKEN;

        if (!token) {
            throw new Error('TMDB token is missing.');
        }

        if (!Number.isSafeInteger(movieId) || movieId <= 0) {
            throw new Error('Invalid movie ID.');
        }

        const url = new URL(
            `https://api.themoviedb.org/3/movie/${movieId}`
        );

        url.searchParams.set('language', 'en-US');

        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`,
                accept: 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(
                `TMDB details failed: ${response.status}`
            );
        }

        const data = await response.json();

        return {
            runtime: data.runtime,
            genre: data.genres?.[0]?.name || ''
        };
    });
    
    ipcMain.handle('tmdb:fullDetails', async (event, movieId) => {
        const token = process.env.TMDB_TOKEN;

        if (!token) {
            throw new Error('TMDB token is missing.');
        }

        if (!Number.isSafeInteger(movieId) || movieId <= 0) {
            throw new Error('Invalid movie ID.');
        }

        const url = new URL(
            `https://api.themoviedb.org/3/movie/${movieId}`
        );

        url.searchParams.set('language', 'en-US');
        url.searchParams.set('append_to_response', 'credits');

        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`,
                accept: 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(
                `TMDB full details failed: ${response.status}`
            );
        }

        const data = await response.json();

        const director = (data.credits?.crew || [])
            .find(person => person.job === 'Director');

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
            director: director?.name || 'N/A',
            cast: (data.credits?.cast || []).slice(0, 6)
                .map(person => ({
                    name: person.name,
                    character: person.character,
                    profile_path: person.profile_path
                }))
        };
    });


    // Open the application
    createWindow();

    // Reopen window on macOS
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Close application when all windows are closed
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
