$(document).ready(function() {

  /*compile template*/
  var listTemplateSource = $('#list-template').html();
  var starsTemplateSource = $('#stars-template').html();
  var listTemplate = Handlebars.compile(listTemplateSource);
  var starsTemplate = Handlebars.compile(starsTemplateSource);

  /*on click on search button*/
  $('.searchbar').keypress(function(event) {
    if (event.which == 13) {
      search();
    }
  });/*keypress end*/

  /*on click on search button*/
  $('.header-right .fa-search').click(function () {
    search();
  });/*click end*/

/* * FUNCTIONS * */

/*HANDLE-DATA - cycle every object in the result of your query*/
function handleData(resultsArray) {
  for (var i = 0; i < resultsArray.length; i++) {
    var currentMovie = resultsArray[i];
    printMovieDetails(currentMovie);
    printStars(currentMovie.vote_average);
  }
};

/*PRINT-MOVIE-DETAILS - grab info on a singe item and print it in the template*/
function printMovieDetails(item) {
  var context = {
    'title': item.title,
    'originalTitle': item.original_title,
    'language': item.original_language,
  }
  /*** DELETE - var created because I needed the log ***/
  var title = item.title;
  console.log(title);

  var html = listTemplate(context);
  $('#results-display').append(html);
}

/*PRINT-STARS - get average vote, fit to scale of 5, print 5 empty stars and fill them out according to average vote*/
function printStars(voteAverage) {
  var starsNr = Math.round(voteAverage / 2);
  console.log(starsNr);
  var stars = $('.movie-card:last-child li[data-info-type="vote"] i').slice(0, starsNr);
  console.log(stars);
  for (var a = 0; a < stars.length; a++) {
    $('.movie-card:last-child li[data-info-type="vote"] i:nth-child('+(a + 1)+')').removeClass('far').addClass('fas');
  }
}

/*SEARCH - */
function search() {
  /*grab user search*/
  var userSearch = $('.searchbar').val().trim();
  /*if the string isn't empty*/
  if (userSearch.length > 1) {
    /*empty input*/
    $('.searchbar').val('');
    /*remove any cards already in page*/
    $('#results-display .movie-card').remove();
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
  }/*if end*/
};

})/*DNT closing doc.ready*/
