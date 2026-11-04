const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('movieAPI', {

    // Search movies by title
    searchMovies: (title) =>
        ipcRenderer.invoke('tmdb:search', title),

    // Discover movies by genre
    discoverMovies: (genreId) =>
        ipcRenderer.invoke('tmdb:discover', genreId),

    // Get runtime and genre automatically
    
    getMovieDetails: (movieId) =>
        ipcRenderer.invoke('tmdb:details', movieId),

    getFullMovieDetails: (movieId) =>
        ipcRenderer.invoke('tmdb:fullDetails', movieId)
});
