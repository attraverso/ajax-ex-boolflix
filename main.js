/*CHALLENGE: do not write any html in main.js*/

$(document).ready(function() {

/*set global constants*/
const api_url = 'https://api.themoviedb.org/3/';
const api_key = 'e99307154c6dfb0b4750f6603256716d';
const img_url = 'https://image.tmdb.org/t/p/';

/*compile template*/
var listTemplateSource = $('#list-template').html();
var listTemplate = Handlebars.compile(listTemplateSource);
var selectTemplateSource = $('#select-template').html();
var selectTemplate = Handlebars.compile(selectTemplateSource);

/*grab all tv and movie genres and store them for later use*/
var tvGenres = [];
var tvGenresEndpoint = 'genre/tv/list';
var movieGenres = [];
var movieGenresEndpoint = 'genre/movie/list';
getTvGenres(tvGenresEndpoint);
getMovieGenres(movieGenresEndpoint);

/*when Enter is pressed, start search*/
$('.searchbar').keypress(function(event) {
  if (event.which == 13) {
    search();
  } else {
    $('.searchbar-cross').addClass('active');
  }
});

/*on click on searchbar cross, hide searchbar*/
$('.searchbar-cross').click(function() {
  $('.searchbar').val('');
  $('.searchbar').removeClass('active');
  $('.searchbar-cross').removeClass('active');
})

/*on mousedown on search icon, if the input is displayed, start search*/
$('.header-right .fa-search').click(function(){
  if ($('.searchbar').hasClass('active')) {
    $('.header-right .fa-search').click(search);
  } else {
    $('.searchbar').addClass('active');
    $('.searchbar').focus();
  }
})

/*on click on tv/movies in header-left, show genres selection dropdown. hide on mouseleave*/
$('.dropdown-hook').click(function() {
  $(this).children('.dropdown').toggleClass('active');
}).mouseleave(function() {
  $(this).children('.dropdown').removeClass('active');
})
$('.dropdown').mouseleave(function() {
  $(this).removeClass('active');
})

/*on click on dropdown item, leave on page only the cards of matching genre*/
$('.dropdown').on('click', 'li', function() {
  var lookFor = $(this).text();
  console.log(lookFor);
  $('.item-card').each(function() {
    var currentGenres = $(this).find('li[data-info-type="genres"]').text();
    console.log(currentGenres);
    if (!currentGenres.includes(lookFor)) {
      $(this).remove();
    }
  })
  // filterCards(lookFor);
})

// function filterCards(genre) {
//   $('.item-card').each(function() {
//     var currentGenres = $(this).find('li[data-info-type="genres"]').text();
//     console.log(currentGenres);
//
//   })
// }

/*on click on an item-card, show the back of the card. On mouseleave, show the front*/
$('#results-display').on('click', '.item-card', function() {
  $(this).find('.item-card-img').removeClass('active');
  $(this).find('.item-card-title').removeClass('active');
  $(this).find('.item-card-info').addClass('active');
  $(this).find('.item-card-noimg').removeClass('active');
}).on('mouseleave', '.item-card', function() {
  $(this).find('.item-card-img').addClass('active');
  $(this).find('.item-card-title').addClass('active');
  $(this).find('.item-card-info').removeClass('active');
  $(this).find('.item-card-noimg').addClass('active');
});

/* * FUNCTIONS - ORDER OF APPEARANCE * */

/*grab all movie genres from TMD*/
function getMovieGenres(endpoint) {
  $.ajax({
    'url': api_url + endpoint,
    'method': 'get',
    'data': {
      'api_key': api_key,
    },
    'success': function(data) {
      movieGenres = data.genres;
      /*** perché se faccio array.push(data.genres) mi mette dentro ogni singolo oggetto più tutto l'array completo?***/
      for (var i = 0; i < movieGenres.length; i++) {
        var currentGenre = movieGenres[i].name;
        var currentLowGenre = currentGenre.toLowerCase();
        var context = {
          'genreLow': currentLowGenre,
          'genre': currentGenre,
        }
        var html = selectTemplate(context);
        $('.dd-movies').append(html);
      }
    },
    'error': function() {
      console.log('ajax error');
    },
  });
}
/*grab all tv genres from TMD*/
function getTvGenres(endpoint) {
  $.ajax({
    'url': api_url + endpoint,
    'method': 'get',
    'data': {
      'api_key': api_key,
    },
    'success': function(data) {
      tvGenres = data.genres;
      /*get the name of every genre and print it in page*/
      for (var i = 0; i < tvGenres.length; i++) {
        var currentGenre = tvGenres[i].name;
        var currentLowGenre = currentGenre.toLowerCase();
        var context = {
          'genreLow': currentLowGenre,
          'genre': currentGenre,
        }
        var html = selectTemplate(context);
        $('.dd-tv').append(html);
      }
    },
    'error': function() {
      console.log('ajax error');
    },
  });
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
    /*get results for both movies and tv shows*/
    callAjax(userSearch, 'search/movie', 'movie');
    callAjax(userSearch, 'search/tv', 'series');
  }
};

/**CALL-AJAX - call the TMD API via ajax**/
function callAjax(searchString, endPoint, cardType) {
  $.ajax({
    'url': api_url + endPoint,
    'method': 'get',
    'data': {
      'api_key': api_key,
      'query': searchString,
    },
    'success': function(data) {
      /*if the search returns anything at all*/
      if (data.total_results != 0) {
        /*show related terms bar*/
        $('.results-display-header').addClass('active');
        /*handle the data*/
        handleData(data.results, cardType);
      /* if the search returns nothing, tell the user*/
      } else {
        $('#error-display').addClass('active');
      }
    }, /*if ajax fails to call*/
    'error': function() {
      alert('Seems like we had a problem retrieving your search.');
    }
  })/*ajax end*/
}

/*HANDLE-DATA - cycle every object in the result of your query*/
function handleData(resultsArray, cardType) {
  /*for every object returned by the call*/
  for (var i = 0; i < resultsArray.length; i++) {
    var currentItem = resultsArray[i];
    printMovieDetails(currentItem, cardType);
    printTalentList(currentItem, cardType);
    noDuplicateTitle(currentItem);
    keepFlagIfAvaliable(currentItem);
    printFullStars(currentItem.vote_average);
    manageEmptyCards(currentItem);
  }
};

/*PRINT-MOVIE-DETAILS - grab info on a singe item and print it in the template*/
function printMovieDetails(item, cardType) {
  /*grab the current item's poster path and build the complete url*/
  var posterTrimmed = item.backdrop_path;
  var poster = img_url + 'w300/' + posterTrimmed;
  /*grab correct title based on item media type, movie or tv*/
  /*if the item is a movie*/
  if (item.hasOwnProperty('title')) {
    var itemTitle = item.title;
    var itemOrigTitle = item.original_title;
    /*if the item is a series*/
  } else {
    var itemTitle = item.name;
    var itemOrigTitle = item.original_name;
  }
  /*grab current item's genre id(s)*/
  itemGenreIds = item.genre_ids;
  /*convert id(s) into name(s), based on item's media type*/
  if (cardType == 'movie') {
    var finalGenres = getGenresNames(movieGenres, itemGenreIds, item)
  } else if (cardType = 'series') {
    finalGenres = getGenresNames(tvGenres, itemGenreIds, item)
  }
  /*populate template*/
  var context = {
    'title': itemTitle,
    'originalTitle': itemOrigTitle,
    'language': item.original_language,
    'poster': poster,
    'synopsis': item.overview,
    'cardId': item.id,
    'genres': finalGenres,
  }
  var html = listTemplate(context);
  /*print template*/
  $('#results-display').append(html);
}

/* GET-GENRES-NAMES - given an item's genre ids, get the corresponding names instead*/
function getGenresNames(array, genreIds, item) {
  var itemId = item.id;
  var currentGenres = '';
  /*go through the item's genre ids and grab one at a time*/
  for (var i = 0; i < genreIds.length; i++) {
    var currentGenId = genreIds[i];
    /*go through all the genres for that media type, if there's a match, print the name*/
    for (var n = 0; n < movieGenres.length; n++) {
      if (currentGenId == movieGenres[n].id) {
      currentGenres += (array[n].name+ ', ');
      }
    }
  }
  return currentGenres;
}

/* PRINT-TALENT-LIST*/
function printTalentList(item, cardType) {
  /*grab the id of the current item*/
  var itemId = item.id;
  /*build appropriate endpoint based on media type*/
  if (cardType == 'series') {
    var currentEndPoint = 'tv/' + itemId + '/credits';
  } else if (cardType == 'movie') {
    var currentEndPoint = 'movie/' + itemId + '/credits';
  }

  $.ajax({
    'url': api_url + currentEndPoint,
    'method': 'get',
    'data': {
      'api_key': api_key,
      'query': null,/***will I need this for the genres?***/
    },
    'success': function(data, itemId) {
      /*grab the id again because ducking local variables*/
      var itemId = item.id;
      var talentList = [];
      /*go through the whole list of results, if needed*/
      for (var i = 0; i < data.cast.length; i++) {
        /*grab the name value of the current object*/
        var talent = data.cast[i].name;
        /*if the list hasn't reached 5 items*/
        if (talentList.length < 5) {
          /*if the current name is a valid value*/
          if (talent != undefined && talent != null) {
            /*add to list of talents*/
            talentList.push(' ' + talent);
          }
        /*if you already have five names, break the cycle*/
        } else {
          break
        }
      }
      /*print talent list in HTML*/
      $('.item-card[data-card-id="' + itemId + '"] li[data-info-type="cast"]').text(talentList);
    },
    'error': function() {
      console.log('ajaxtalent error')
    }
  })/*ajax end*/
}

/*NO-DUPLICATE-TITLE - if the title and original title are the same, show only the title*/
function noDuplicateTitle(item) {
  /*if title and original titles are equal, and neither is undefined*/
  if (item.title != undefined && (item.title == item.original_title) || item.name != undefined && (item.name == item.original_name)) {
    /*print only one title*/
    $('.item-card:last-child li[data-info-type="original-title"]').remove();
  }
}

/*KEEP-FLAG-IF-AVAILABLE - if you have a flag icon for the requested language, remove language list item. Otherwise remove flag list item.*/
function keepFlagIfAvaliable(forItem) {
  /*list of available flags*/
  var availableLanguages = ['ar', 'de', 'en', 'es', 'fr', 'it', 'ja', 'zh'];
  /*if you have a flag for the current item's language*/
  if (availableLanguages.includes(forItem.original_language.toString())) {
    /*remove the language list item*/
    $('.item-card:last-child li[data-info-type="language"]').remove();
  /*if you don't have a flag*/
  } else {
    /*remove the flag list item*/
    $('.item-card:last-child li[data-info-type="lang-flag"]').remove();
  }
};

/*PRINT-FULL-STARS - get average vote, fit to scale of 5, fill stars in html according to average vote*/
function printFullStars(voteAverage) {
  /*make the average vote a rounded number from 1 to 5*/
  var starsNr = Math.round(voteAverage / 2);
  /*grab the first x empty stars based on starsNr value*/
  // var stars = $('.item-card:last-child li[data-info-type="vote"] i').slice(0, starsNr);/*** questa la lasciamo a imperitura memoria perché LAMISERIA (ma ci vorrebbe pure lo stars.length sotto)***/
  for (var i = 1; i <= starsNr; i++) {
    /*grab all those stars and make them full*/
    $('.item-card:last-child li[data-info-type="vote"] i:nth-child('+(i)+')').removeClass('far').addClass('fas');
  }
}

/*MANAGE-EMPTY-CARDS - if a card's image path isn't present, remove the whole img element*/
function manageEmptyCards(item) {
  if (item.backdrop_path === null) {
    $('.item-card:last-child img').remove();
    /*display warning text*/
    $('.item-card:last-child .item-card-noimg').addClass('active');
  } else {
    $('.item-card:last-child .item-card-noimg').remove();
  }
}

})/*DNT closing doc.ready*/
