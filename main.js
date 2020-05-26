/*CHALLENGE: do not write any html in main.js*/

$(document).ready(function() {

const api_url = 'https://api.themoviedb.org/3/';
const api_key = 'e99307154c6dfb0b4750f6603256716d';
const img_url = 'https://image.tmdb.org/t/p/';

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
  $('.header-right .fa-search').click(search);

  /*on click on item-card*/
  $('#results-display').on('click', '.item-card', function() {
    // alert('hello');
    $(this).find('.item-card-img').toggleClass('active');
    $(this).find('.item-card-title').toggleClass('active');
    $(this).find('.item-card-info').toggleClass('active');
    $(this).find('.item-card-noimg').toggleClass('active');
  })

/* * FUNCTIONS - alphabetical order * */

/*CALL-AJAX - call the TMD API via ajax*/
function callAjax(searchString, endPoint) {
  $.ajax({
    'url': api_url + endPoint,
    'method': 'get',
    'data': {
      'api_key': api_key,
      'query': searchString,
    },
    'success': function(data) {
      if (data.total_results != 0) {
        $('.results-display-header').addClass('active');
        handleData(data.results);
      } else {
        $('#error-display').addClass('active');
      }
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
    keepFlagIfAvaliable(currentMovie);
    printFullStars(currentMovie.vote_average);
    manageEmptyCards(currentMovie);
  }
};

/*MANAGE-EMPTY-CARDS - if a card has no backdrop, remove it entirely*/
function manageEmptyCards(item) {
  if (item.backdrop_path == null) {
    $('.item-card:last-child img').remove();
    $('.item-card:last-child .item-card-noimg').addClass('active');
  } else {
    $('.item-card:last-child .item-card-noimg').remove();
  }
}

/*NO-DUPLICATE-TITLE - if the title and original title are the same, show only title*/
function noDuplicateTitle(item) {
  if (item.title != undefined && (item.title == item.original_title) || item.name != undefined && (item.name == item.original_name)) {
    $('.item-card:last-child li[data-info-type="original-title"]').remove();
  }
}

/*PRINT-FLAG-IF-AVAILABLE - if you have a flag icon for the requestedlanguage, remove language list item. Otherwise remove flag list item.*/
function keepFlagIfAvaliable(forItem) {
  var availableLanguages = ['ar', 'de', 'en', 'es', 'fr', 'it', 'ja', 'zh'];
  if (availableLanguages.includes(forItem.original_language.toString())) {
    $('.item-card:last-child li[data-info-type="language"]').remove();
  } else {
    $('.item-card:last-child li[data-info-type="lang-flag"]').remove();
  }
};

/*PRINT-FULL-STARS - get average vote, fit to scale of 5, fill stars in html according to average vote*/
function printFullStars(voteAverage) {
  var starsNr = Math.round(voteAverage / 2);
  var stars = $('.item-card:last-child li[data-info-type="vote"] i').slice(0, starsNr);
  for (var i = 0; i < stars.length; i++) {
    $('.item-card:last-child li[data-info-type="vote"] i:nth-child('+(i + 1)+')').removeClass('far').addClass('fas');
  }
}

/*PRINT-MOVIE-DETAILS - grab info on a singe item and print it in the template*/
function printMovieDetails(item) {
  var posterTrimmed = item.backdrop_path;
  var poster = img_url + 'w300/' + posterTrimmed;

  /*hasownproperty?*/

  var context = {
    'title': item.title || item.name,
    'originalTitle': item.original_title || item.original_name,
    'language': item.original_language,
    'poster': poster,
    'synopsis': item.overview,
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
    /*remove related search terms*/
    $('.results-display-header').removeClass('active');

    callAjax(userSearch, 'search/movie');
    callAjax(userSearch, 'search/tv');
  }/*if end*/
};

})/*DNT closing doc.ready*/
