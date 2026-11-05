const { contextBridge, ipcRenderer } = require('electron');

// Search movies by title
function searchMovies(title) {
    return ipcRenderer.invoke('tmdb:search', title);
}

// Discover movies based on genre
function discoverMovies(genreId) {
    return ipcRenderer.invoke('tmdb:discover', genreId);
}

// Get movie runtime and genre
function getMovieDetails(movieId) {
    return ipcRenderer.invoke('tmdb:details', movieId);
}

// Get full movie information
function getFullMovieDetails(movieId) {
    return ipcRenderer.invoke('tmdb:fullDetails', movieId);
}

// Make movie functions available to the frontend
contextBridge.exposeInMainWorld('movieAPI', {
    searchMovies: searchMovies,
    discoverMovies: discoverMovies,
    getMovieDetails: getMovieDetails,
    getFullMovieDetails: getFullMovieDetails
});