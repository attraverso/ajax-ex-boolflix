$(document).ready(function() {

  /*compile template*/
  var source = $('#list-template').html();
  var template = Handlebars.compile(source);

  /*on click on search button*/
  $('.header-search-btn').click(function () {
    /*grab user search*/
    var userSearch = $('.searchbar').val().trim();
    console.log(userSearch);
    /*if the string isn't empty*/
    if (userSearch != '') {
      /*empty input*/
      $('.searchbar').val('');
      /*remove any cards already displayed*/
      $('#movies-display .movie-card').remove();
      $.ajax({
        'url': 'https://api.themoviedb.org/3/search/movie',
        'method': 'get',
        'data': {
          'api_key': 'e99307154c6dfb0b4750f6603256716d',
          'query': userSearch,
        },
        'success': function(data) {
          handleData(data.results);
        },
        'error': function() {
          alert('Seems like we had a problem retrieving your search.');
        }
      })/*ajax end*/
    }/*if value empty - end*/
  });/*click end*/

/* * FUNCTIONS * */

/*cycle every object in the result of your query*/
function handleData(resultsArray) {
  for (var i = 0; i < resultsArray.length; i++) {
    var currentMovie = resultsArray[i];
    printMovieDetails(currentMovie);
  };
};

/*grab the relevant info and print it in a template*/
function printMovieDetails(movie) {
var title = movie.title;
var originalTitle = movie.original_title;
var lang = movie.original_language;
var vote = movie.vote_average;

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
