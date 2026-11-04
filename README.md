# MyMovie — Personal Movie Planner

MyMovie is an Electron-based desktop application that allows users to discover movies, manage their personal watchlist, and analyse their movie-watching progress.

## Features

- **Discover Movies:** Search for movies using the TMDB API.
- **Genre Recommendations:** Discover movies based on selected genres and rating criteria.
- **Movie Details:** View movie information, synopsis, runtime, director, and cast.
- **My Watchlist:** Add, view, edit, and delete saved movies.
- **Movie Analytics:** Track total movies, watched movies, planned movies, total runtime, and genre distribution.
- **Local Storage:** Save watchlist data between application sessions.

## Technologies Used

- Electron
- HTML5
- CSS3
- JavaScript
- TMDB API
- Local Storage
- Node.js

## Pages

1. Discover Movies
2. My Watchlist
3. Movie Analytics Dashboard
4. Movie Details

## API Configuration

This application uses the TMDB API to retrieve movie information.

Users must obtain their own TMDB API Read Access Token from [The Movie Database](https://www.themoviedb.org/).

Create a `.env` file in the project root and configure the following environment variable:

```env
TMDB_TOKEN=YOUR_OWN_TMDB_READ_ACCESS_TOKEN
```

**Note:** API credentials are private and are not included in this repository.

## Installation

1. Clone the repository.
2. Open the project folder in VS Code.
3. Install dependencies:

   `npm install`

4. Configure the TMDB API token as described in the API Configuration section.
5. Start the application:

   `npm start`

## Data Source

Movie information is provided by The Movie Database (TMDB). This application uses the TMDB API but is not endorsed or certified by TMDB.

## Project Information

**Project:** MyMovie — Personal Movie Planner  
**Course:** CSC2923 Object Oriented Programming  
**Application Type:** Desktop Application
