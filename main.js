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
});

/* * FUNCTIONS - order of appearance * */

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

    callAjax(userSearch, 'search/movie', 'movie');
    callAjax(userSearch, 'search/tv', 'series');
  }/*if end*/
};

/*CALL-AJAX - call the TMD API via ajax*/
function callAjax(searchString, endPoint, cardType) {
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
        handleData(data.results, cardType);
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
function handleData(resultsArray, cardType) {
  for (var i = 0; i < resultsArray.length; i++) {
    var currentItem = resultsArray[i];
    printMovieDetails(currentItem, cardType);
    noDuplicateTitle(currentItem);
    keepFlagIfAvaliable(currentItem);
    printFullStars(currentItem.vote_average);
    manageEmptyCards(currentItem);
  }
};

/*PRINT-MOVIE-DETAILS - grab info on a singe item and print it in the template*/
function printMovieDetails(item, cardType) {
  var posterTrimmed = item.backdrop_path;
  var poster = img_url + 'w300/' + posterTrimmed;
  /*hasownproperty?*/
  if (item.hasOwnProperty('title')) {
    var itemTitle = item.title;
    var itemOrigTitle = item.original_title;
  } else {
    var itemTitle = item.name;
    var itemOrigTitle = item.original_name;
  }

  var context = {
    'title': itemTitle,
    'originalTitle': itemOrigTitle,
    'language': item.original_language,
    'poster': poster,
    'synopsis': item.overview,
    'cardId': item.id,
  }

  var html = listTemplate(context);
  $('#results-display').append(html);

  var itemId = item.id;
  console.log(itemId);
  if (cardType == 'series') {
    var currentEndPoint = 'tv/' + itemId + '/credits';
    // console.log('endpoint tv: ' + currentEndPoint);
  } else if (cardType == 'movie') {
    var currentEndPoint = 'movie/' + itemId + '/credits';
    // console.log('endpoint film: ' + currentEndPoint);
  }
  // var currentEndPoint = 'credit/' + itemId;

  $.ajax({
    'url': api_url + currentEndPoint,
    'method': 'get',
    'data': {
      'api_key': api_key,
    },
    'success': function(data, itemId) {
      // console.log(data);
      var itemId = item.id;
      var talentList = [];
      for (var i = 0; i < data.cast.length; i++) {
        var talent = data.cast[i].name;
        // console.log('talent: ' + talent);
        if (talentList.length < 5) {
          if (talent != undefined && talent != null) {
            talentList.push(' ' + talent);
            // console.log(talentList);
          }
        } else {
          break
        }
      }
      // console.log('cast inside ajax: ' + talentList);
      $('.item-card[data-card-id="' + itemId + '"] li[data-info-type="cast"]').text(talentList);
    },
    'error': function() {
      // console.log('ajax2 error')
    }
  })/*ajax end*/
}

/*NO-DUPLICATE-TITLE - if the title and original title are the same, show only title*/
function noDuplicateTitle(item) {
  if (item.title != undefined && (item.title == item.original_title) || item.name != undefined && (item.name == item.original_name)) {
    $('.item-card:last-child li[data-info-type="original-title"]').remove();
  }
}

/*KEEP-FLAG-IF-AVAILABLE - if you have a flag icon for the requestedlanguage, remove language list item. Otherwise remove flag list item.*/
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

/*MANAGE-EMPTY-CARDS - if a card has no backdrop, remove it entirely*/
function manageEmptyCards(item) {
  if (item.backdrop_path == null) {
    $('.item-card:last-child img').remove();
    $('.item-card:last-child .item-card-noimg').addClass('active');
  } else {
    $('.item-card:last-child .item-card-noimg').remove();
  }
}

})/*DNT closing doc.ready*/
