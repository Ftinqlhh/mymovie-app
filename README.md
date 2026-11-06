# MyMovie — Personal Movie Planner

MyMovie is an Electron-based desktop application that allows users to discover movies, explore genre-based recommendations, manage their personal watchlist, and track their movie-watching progress.

## Features

- **Discover Movies:** Search for movies by title using the TMDB API and browse featured movies.
- **Genre-Based Recommendations:** Discover movies based on selected genres and minimum rating criteria.
- **Movie Details:** View detailed movie information, including synopsis, release date, genre, runtime, rating, director, and cast.
- **My Watchlist (CRUD):** Add, view, edit, and delete movies from a personal watchlist.
- **Watchlist Statistics:** Track total movies, watched movies, planned movies, total runtime, and watch progress percentage directly on the My Watchlist page.
- **Local Storage:** Save watchlist data locally so movie records remain available between application sessions.
- **Input Validation and Error Handling:** Validate movie information and display appropriate messages when errors occur.

## Technologies Used

- Electron
- Node.js
- JavaScript
- HTML5
- CSS3
- TMDB API
- Local Storage

## Application Pages

1. **Discover Movies (`index.html`)** — Search for movies, browse featured movies, and receive genre-based recommendations.
2. **My Watchlist (`watchlist.html`)** — Manage saved movies using CRUD operations and view watchlist statistics.
3. **Movie Details (`details.html`)** — View detailed information about selected movies.

## API Configuration

This application uses the TMDB API to retrieve movie information.

Users must obtain their own TMDB API Read Access Token from [The Movie Database](https://www.themoviedb.org/).

Create a `.env` file in the project root directory and add the following environment variable:

```env
TMDB_TOKEN=YOUR_OWN_TMDB_READ_ACCESS_TOKEN
```

**Note:** API credentials are private and are not included in this repository. Do not share or commit your actual API token.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Ftinqlhh/mymovie-app.git
   ```

2. Open the project folder:

   ```bash
   cd mymovie-app
   ```

3. Install the required dependencies:

   ```bash
   npm install
   ```

4. Configure your TMDB API token in the `.env` file as described above.

5. Start the application:

   ```bash
   npm start
   ```

## Data Storage

MyMovie uses the browser's Local Storage to store watchlist records under the key `mymovie_watchlist`.

Movie records are stored in JSON format and include information such as title, genre, runtime, and watching status. Watchlist statistics are calculated from these saved records.

## Data Source

Movie information is provided by The Movie Database (TMDB).

This application uses the TMDB API but is not endorsed or certified by TMDB.

## Project Information

**Project:** MyMovie — Personal Movie Planner

**Course:** CSC2923 Object Oriented Programming

**Application Type:** Desktop Application

**Framework:** Electron