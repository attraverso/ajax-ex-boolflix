May 22nd, 2020

### Project description:
Final JavaScript-oriented project. Use the The Movie Database API to replicate an approximation of Netflix's search interface.

**Minimum requirements:**
1. Create a searchbar where the user can input the name of a show/movie or part of it.
2. By clicking on the search button, the API is interrogated and returns the following info for all relevant *movies*:
  - Title
  - Original title
  - Language
  - Rating
3. Get the numeric value (1 to 10) of the rating and manipulate it so that the rating can be expressed in a scale of 1 to 5 full stars.
4. Replace the language name with the corresponding flag, and manage the case where the current language doesn't have an associated flag.
5. Include a second API call that looks for *TV shows* that answer to the same user search from point 2.
6. Add the shows'/movies' posters to the relative cards.
7. Add a proper header with logo and searchbar.
8. Make the show/movie info into proper cards with the poster image as background.
9. By interacting with a card, the show/movie info is displayed (add the overview to the available info).

**Bonus features:**
- Add to each card the name of the first 5 actors/actresses listed for that movie/show.
- Get the list of genres from the API and make it possible to filter the movies/shows by genre, hiding/showing the relevant cards as different genres get requested.

**Personal improvements:**
- Searchbar animation
- Card animation
- Pressing the enter key starts the search without need of clicking the search button
- When there is text in the searchbar, it can be cleared by pressing the X icon, which also closes the searchbar.
- Added an 'image unavailable' panel for movies/shows that do not have an image attached.
- Added pagination.
- Implemented half-stars to improve the precision of ratings.

### Goals:

Practice dealing with more complex API calls and building a solid structure that can accommodate for what is or isn't returned.

### Libraries:
 - jQuery
 - Handlebars

