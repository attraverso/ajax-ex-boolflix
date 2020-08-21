// $(document).ready(function() { /*commented because it was deferred in the htrml script*/

/*set global constants*/
const api_url = 'https://api.themoviedb.org/3/';
const api_key = 'e99307154c6dfb0b4750f6603256716d';
const img_url = 'https://image.tmdb.org/t/p/';
const tvGenresEndpoint = 'genre/tv/list';
const movieGenresEndpoint = 'genre/movie/list';

/*compile template*/
var listTemplateSource = $('#list-template').html();
var listTemplate = Handlebars.compile(listTemplateSource);
var selectTemplateSource = $('#select-template').html();
var selectTemplate = Handlebars.compile(selectTemplateSource);
var paginationTemplateSource = $('#pagination-template').html();
var paginationTemplate = Handlebars.compile(paginationTemplateSource);

/*grab all tv and movie genres and store them for later use*/
var tvGenres = [];
var movieGenres = [];
getTvGenres(tvGenresEndpoint);
getMovieGenres(movieGenresEndpoint);

/* close disclaimer tab*/
$('.disclaimer-close').click(() => $('.disclaimer').hide())

/*searchbar: while typing, start search if the Enter key is pressed*/
$('.searchbar').keypress(function(event) {
  if (event.which == 13) {
    search();
  } else {
    $('.searchbar-cross').addClass('active');
  }
});

/*searchbar: on click on searchbar cross, hide searchbar*/
$('.searchbar-cross').click(function() {
  $('.searchbar').val('');
  $('.searchbar').removeClass('active');
  $('.searchbar-cross').removeClass('active');
})

/*on click on search icon in header:
* if the input field is displayed, start search
* it it's not, fisplay input field*/
$('.header-right .fa-search').click(function(){
  if ($('.searchbar').hasClass('active')) {
    $('.header-right .fa-search').click(search);
  } else {
    $('.searchbar').addClass('active');
    $('.searchbar').focus();
  }
})

/*menu: on click on tv/movies menu item in header-left, show genres selection dropdown. hide on mouseleave*/
$('.dropdown-hook').click(function() {
  $(this).children('.dropdown').toggleClass('active');
}).mouseleave(function() {
  $(this).children('.dropdown').removeClass('active');
})
$('.dropdown').mouseleave(function() {
  $(this).removeClass('active');
})

/*menu: on click on genres dropdown item, display on page only the cards of matching genre*/
$('.dropdown').on('click', 'li', function() {
  $('.item-card').show();
  var lookFor = $(this).text();
  console.log(lookFor);
  $('.item-card').each(function() {
    var currentGenres = $(this).find('li[data-info-type="genres"]').text();
    console.log(currentGenres);
    if (!currentGenres.includes(lookFor)) {
      $(this).hide();
    }
  })
  // filterCards(lookFor);
})

/*** //XXX currently failed attempt at putting all this in a function***/
// function filterCards(genre) {
//   $('.item-card').each(function() {
//     var currentGenres = $(this).find('li[data-info-type="genres"]').text();
//     console.log(currentGenres);
//
//   })
// }

/*cards: on click on an item-card, show the back of the card. On mouseleave, show the front*/
$('#results-display').on('click', '.item-card', function() {
  $(this).find('.item-card-img').removeClass('active');
  $(this).find('.item-card-noimg').removeClass('active');
  $(this).find('.item-card-title').removeClass('active');
  $(this).find('.item-card-info').addClass('active');
}).on('mouseleave', '.item-card', function() {
  $(this).find('.item-card-img').addClass('active');
  $(this).find('.item-card-noimg').addClass('active');
  $(this).find('.item-card-title').addClass('active');
  $(this).find('.item-card-info').removeClass('active');
});

/*pagination: when the user picks a page from the pagination select*/
$('.page-select').on('click', 'option', function() {
  /*grab current search term from search sentry*/
  var currentSearch = $('.searchbar').attr('data-search-sentry');
  /*grab the requested page number*/
  var requestedPage = $(this).val();
  /*reset all the fields affected by a search*/
  cleanSlate(currentSearch);
  callAjax(currentSearch, 'search/movie', 'movie', requestedPage);
  callAjax(currentSearch, 'search/tv', 'series', requestedPage);
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
    /*reset everything related to the search*/
    cleanSlate(userSearch);
    /*get results for both movies and tv shows*/
    callAjax(userSearch, 'search/movie', 'movie');
    callAjax(userSearch, 'search/tv', 'series');
  }
};

/*CLEAN-SLATE - reset all the things that get compiled with every search*/
function cleanSlate(currentSearch) {
  $('.searchbar').val('');
  /*remove any cards already in page*/
  $('#results-display .item-card').remove();
  /*remove any option from pagination select*/
  // $('.header-right option').remove();
  $('.pagination-container').removeClass('active');
  $('.pagination-container option').remove();
  $('#results-display').attr('data-movie-pages', '');
  $('#results-display').attr('data-tv-pages', '');
  /*remove related search terms*/
  $('.results-display-header').removeClass('active');
  /*remove warning after empty search*/
  $('#error-display').removeClass('active');
  /*create sentry for calling ajax to get the following pages*/
  $('.searchbar').attr('data-search-sentry', currentSearch);
}

/**CALL-AJAX - call the TMD API via ajax**/
function callAjax(searchString, endPoint, cardType, pageNr) {
  $.ajax({
    'url': api_url + endPoint,
    'method': 'get',
    'data': {
      'api_key': api_key,
      'query': searchString,
      'page': pageNr,
    },
    'success': function(data) {
      /*if the search returns anything at all*/
      if (data.total_results != 0) {
        /*show related terms bar*/
        $('.results-display-header').addClass('active');
        /*get total number of pages for the current call*/
        setupPagination(data.total_pages, cardType, pageNr);
        /*handle the info in data.results*/
        handleDataResults(data.results, cardType);
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

/*SETUP-PAGINATION - get the total number of pages per media type and compare the respective
* lengths by setting up sentry data attributes, then print the options in page*/
function setupPagination(totalPages, cardType, pageNr = 1) {
  /*create sentries for both movies and tv shows with total page nr*/
  if (cardType == 'movie') {
    $('#results-display').attr('data-movie-pages', totalPages);
  } else if (cardType == 'series') {
    $('#results-display').attr('data-tv-pages', totalPages);
  }
  var movieSentry = $('#results-display').attr('data-movie-pages');
  var tvSentry = $('#results-display').attr('data-tv-pages');
  /*don't act on the first call, where one of the two sentries is still empty*/
  if (movieSentry != '' && tvSentry != '') {
    /*learn which media type gets more results, then use the bigger number
    * to create as many select options*/
    if (movieSentry >= tvSentry) {
      printPageNrOptions(movieSentry);
    } else if (tvSentry > movieSentry) {
      printPageNrOptions(tvSentry);
    }
  }
  $('.pagination-container').addClass('active');
  $('.page-select').val(pageNr);
}

/*PRINT-PAGE-NR-OPTIONS - generate as many options in the pagination select as needed*/
function printPageNrOptions(howMany) {
  for (var i = 1; i <= howMany; i++) {
    var context = {
      'pageNr': i,
    }
    var html = paginationTemplate(context);
    $('.page-select').append(html);
  }
}

/*HANDLE-DATA - cycle every object in the result of your query*/
function handleDataResults(resultsArray, cardType) {
  /*for every object returned by the call*/
  for (var i = 0; i < resultsArray.length; i++) {
    var currentItem = resultsArray[i];
    printMovieDetails(currentItem, cardType);
    printTalentList(currentItem.id, cardType);
    noDuplicateTitle(currentItem);
    keepFlagIfAvaliable(currentItem.original_language, currentItem.id);
    if (currentItem.vote_average != 0) {
      $('.item-card:last-child li[data-info-type="voteNA"]').remove();
      fillStars(currentItem.vote_average, currentItem.id);
    } else {
      $('.item-card:last-child li[data-info-type="vote"]').remove();
    }
    manageEmptyCards(currentItem.backdrop_path, currentItem.id);
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
    var finalGenres = getGenresNames(movieGenres, itemGenreIds)
  } else if (cardType = 'series') {
    finalGenres = getGenresNames(tvGenres, itemGenreIds)
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
function getGenresNames(mediaGenresArray, itemGenreIds) {
  var currentGenres = '';
  /*go through the item's genre ids and grab one at a time*/
  // debugger;
  for (var i = 0; i < itemGenreIds.length; i++) {
    var currentGenId = itemGenreIds[i];
    /*go through all the genres for that media type, if there's a match, print the name*/
    for (var n = 0; n < mediaGenresArray.length; n++) {
      if (currentGenId == mediaGenresArray[n].id && i != (itemGenreIds.length - 1)) {
      currentGenres += (mediaGenresArray[n].name+ ', ');
    } else if (currentGenId == mediaGenresArray[n].id && i == (itemGenreIds.length - 1)) {
    currentGenres += mediaGenresArray[n].name;
    }
  }
  }
  console.log(currentGenres);
  return currentGenres;
}

/* PRINT-TALENT-LIST*/
function printTalentList(itemId, cardType) {
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
    'success': function(data) {
      var talentList = [];
      /*go through the whole list of results, if needed*/
      for (var i = 0; i < data.cast.length; i++) {
        /*grab the name value of the current object*/
        var talent = data.cast[i].name;
        /*if the list hasn't reached 5 items*/
        if (talentList.length < 5) {
          /*and if the current name is a valid value*/
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
  itemId = item.id;
  /*if title and original titles are equal, and neither is undefined*/
  if (item.title != undefined && (item.title == item.original_title) || item.name != undefined && (item.name == item.original_name)) {
    /*print only one title*/
    $('.item-card[data-card-id="' + itemId + '"] li[data-info-type="original-title"]').remove();
  }
}

/*KEEP-FLAG-IF-AVAILABLE - if you have a flag icon for the requested language, remove language list item. Otherwise remove flag list item.*/
function keepFlagIfAvaliable(forLanguage, itemId) {
  /*list of available flags*/
  var availableLanguages = ['ar', 'de', 'en', 'es', 'fr', 'it', 'ja', 'zh'];
  /*if you have a flag for the current item's language*/
  if (availableLanguages.includes(forLanguage.toString())) {
    /*remove the language list item*/
    $('.item-card[data-card-id="' + itemId + '"] li[data-info-type="language"]').remove();
  /*if you don't have a flag*/
  } else {
    /*remove the flag list item*/
    $('.item-card[data-card-id="' + itemId + '"] li[data-info-type="lang-flag"]').remove();
  }
};

/*FILL-STARS - get average vote, fit to scale of 5, fill stars (and halves) in html accordingly*/
function fillStars(voteAverage, itemId) {
  var base5Vote = (voteAverage / 2).toString();
  base5VoteElements = base5Vote.split('.');
  if (base5VoteElements[1] < 10) {
    base5VoteElements[1] = base5VoteElements[1] + '0';
  }
  /*grab the first x empty stars based on starsNr value*/
  for (var i = 1; i <= base5VoteElements[0]; i++) {
    /*grab all those stars and make them full*/
    $('.item-card[data-card-id="' + itemId + '"] li[data-info-type="vote"] i:nth-child('+(i)+')').removeClass('far').addClass('fas');
  }
  if (base5VoteElements[1] > 50) {
    $('.item-card[data-card-id="' + itemId + '"] li[data-info-type="vote"] i:nth-child('+(i)+')').attr('class', '').attr('class', 'fas fa-star-half-alt')
  }
}

/*MANAGE-EMPTY-CARDS - if a card's image path isn't present, remove the whole img element*/
function manageEmptyCards(imagePath, itemId) {
  if (imagePath === null) {
    $('.item-card[data-card-id="' + itemId + '"] img').remove();
    /*display warning text*/
    $('.item-card[data-card-id="' + itemId + '"] .item-card-noimg').addClass('active');
  } else {
    $('.item-card[data-card-id="' + itemId + '"] .item-card-noimg').remove();
  }
}

//})/*DNT closing doc.ready*/

/* * USELESS KEEPSAKE * */
// function fillStarsOLD(voteAverage) {
//   /*make the average vote a rounded number from 1 to 5*/
//   var starsNr = Math.round(voteAverage / 2);
//   /*grab the first x empty stars based on starsNr value*/
//   /*** questa qui sotto la lasciamo a imperitura memoria perché LAMISERIA ma come mi è venuto in mente quella volta di perderci un pomeriggio per una riga che NON SERVIVA***/
//   var stars = $('.item-card:last-child li[data-info-type="vote"] i').slice(0, starsNr);
//   for (var i = 1; i <= stars.length; i++) {
//     /*grab all those stars and make them full*/
//     $('.item-card:last-child li[data-info-type="vote"] i:nth-child('+(i)+')').removeClass('far').addClass('fas');
//   }
// }
