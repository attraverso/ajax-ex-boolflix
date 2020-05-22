$(document).ready(function() {

  var source = $('#list-template').html();
  var template = Handlebars.compile(source);

  $('.header-search-btn').click(function () {
    var userSearch = $('.searchbar').val();
    console.log(userSearch);
    $.ajax({
      'url': 'https://api.themoviedb.org/3/search/movie',
      'method': 'get',
      'data': {
        'api_key': 'e99307154c6dfb0b4750f6603256716d',
        'query': userSearch,
      },
      'success': function(data) {
        handleData(data.results);
      },/*success end*/
      'error': function() {
        alert('Seems like we had a problem retrieving your search.');
      }
    })/*ajax end*/
  });

/* * FUNCTIONS * */

function handleData(resultsArray) {
  for (var i = 0; i < resultsArray.length; i++) {
    var currentMovie = resultsArray[i];
    printMovieDetails(currentMovie);
  }
};

function printMovieDetails(movie) {
  var title = movie.title;
  console.log(title);
  var originalTitle = movie.original_title;
  console.log(originalTitle);
  var lang = movie.original_language;
  console.log(lang);
  var vote = movie.vote_average;
  console.log(vote);

  var context = {
    'title': title,
    'originalTitle': originalTitle,
    'language': lang,
    'vote': vote,
  };

  var html = template(context);
  $('#movies-display').append(html);
};

})/*DNT closing doc.ready*/
