$(document).ready(function() {

  /*compile template*/
  var listTemplateSource = $('#list-template').html();
  var listTemplate = Handlebars.compile(listTemplateSource);

  /*when Enter is pressed*/
  $('.searchbar').keypress(function(event) {
    if (event.which == 13) {
      search();
    }
  });

  /*on click on search button*/
  $('.header-right .fa-search').click(function () {
    search();
  });

/* * FUNCTIONS - alphabetical order * */

/*CALL-AJAX - call the TMD API via ajax*/
function callAjax(searchString, url) {
  $.ajax({
    'url': url,
    'method': 'get',
    'data': {
      'api_key': 'e99307154c6dfb0b4750f6603256716d',
      'query': searchString,
    },
    'success': function(data) {
      handleData(data.results);
    },
    'error': function() {
      alert('Seems like we had a problem retrieving your search.');
    }
  })/*ajax end*/
}

/*HANDLE-DATA - cycle every object in the result of your query*/
function handleData(resultsArray) {
  for (var i = 0; i < resultsArray.length; i++) {
    var currentMovie = resultsArray[i];
    printMovieDetails(currentMovie);
    noDuplicateTitle(currentMovie);
    printFlagIfAvaliable(currentMovie);
    printStars(currentMovie.vote_average);
  }
};

function noDuplicateTitle(item) {
  if (item.title != undefined && (item.title == item.original_title) || item.name != undefined && (item.name == item.original_name)) {
    $('.item-card:last-child li[data-info-type="original-title"]').remove();
  } else  {
  }
}

/*PRINT-FLAG-IF-AVAILABLE - if you have a flag icon for the requestedlanguage, show that. Otherwise show language code.*/
function printFlagIfAvaliable(forItem) {
  var availableLanguages = ['ar', 'de', 'en', 'es', 'fr', 'it', 'zh'];
  if (availableLanguages.includes(forItem.original_language.toString())) {
    $('.item-card:last-child li[data-info-type="language"]').remove();
  } else {
    $('.item-card:last-child li[data-info-type="lang-flag"]').remove();
  }
};

/*PRINT-MOVIE-DETAILS - grab info on a singe item and print it in the template*/
function printMovieDetails(item) {
  var posterTrimmed = item.poster_path;
  var poster = 'https://image.tmdb.org/t/p/w185/' + posterTrimmed;
  var context = {
    'title': item.title || item.name,
    'originalTitle': item.original_title || item.original_name,
    'language': item.original_language,
    'poster': poster,
  }

  /*** DELETE - vars created because I needed the logs ***/
  var title = item.title;
  // console.log('title:' + title);
  var origTitle = item.original_title;
  // console.log('orig title:' + origTitle);
  var name = item.name;
  // console.log('name :' + name);
  var origName = item.original_name;
  // console.log('orig name :' + origName);/*end D*/

  var html = listTemplate(context);
  $('#results-display').append(html);
}

/*PRINT-STARS - get average vote, fit to scale of 5, print 5 empty stars and fill them out according to average vote*/
function printStars(voteAverage) {
  var starsNr = Math.round(voteAverage / 2);
  var stars = $('.item-card:last-child li[data-info-type="vote"] i').slice(0, starsNr);
  for (var i = 0; i < stars.length; i++) {
    $('.item-card:last-child li[data-info-type="vote"] i:nth-child('+(i + 1)+')').removeClass('far').addClass('fas');
  }
}

/*SEARCH - start ajax call(s) based on the user's search term*/
function search() {
  /*grab user search*/
  var userSearch = $('.searchbar').val().trim();
  /*if the string isn't empty*/
  if (userSearch.length > 1) {
    /*empty input*/
    $('.searchbar').val('');
    /*remove any cards already in page*/
    $('#results-display .item-card').remove();

    var moviesUrl = 'https://api.themoviedb.org/3/search/movie';
    var seriesUrl = 'https://api.themoviedb.org/3/search/tv';

    callAjax(userSearch, moviesUrl);
    callAjax(userSearch, seriesUrl);
  }/*if end*/
};

})/*DNT closing doc.ready*/
