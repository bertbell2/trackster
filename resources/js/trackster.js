var Trackster = {};

/* Main entry point on document ready */
$(document).ready( function() {
  $("#search-button").click(function(){
    var searchText = $("#search-input").val();
    Trackster.searchTracksByTitle(searchText) ;
  });

  $(".header input").on('keyup', function(e) {
    if (e.keyCode === 13) {
      $("#search-button").click();
    }
  });

  $('.songsort').click(function(){
    var prev_sel = $('#song-list').data("sort-column");
    if (undefined != prev_sel && prev_sel !== null && prev_sel.length !== 0) {
      Trackster.toggleColumnSelection(prev_sel);
    }
    var sel = $(this).text();
    var tracks = $('#song-list').data("tracks");
    if (sel.length === 0) {
      sel = "Track-Number"
    }
    switch (sel) {
      case 'Track-Number':
        tracks.sort(Trackster.compareTrackNumber);
        break ;
      case 'Song':
        tracks.sort(Trackster.compareName);
        break;
      case 'Album':
        tracks.sort(Trackster.compareAlbum);
        break;
      case 'Artist':
        tracks.sort(Trackster.compareArtist);
        break;
      case 'Popularity':
        tracks.sort(Trackster.comparePopularity);
        break;
    }

    Trackster.renderTracks(tracks);
    Trackster.toggleColumnSelection(sel);
    $('#song-list').data("sort-column", sel);

  });
});

Trackster.toggleColumnSelection = function(sel) {
  var columnId = "";
  var className = "" ;
  switch (sel) {
    case 'Track-Number':
      columnId = "#track-number";
      className = "fa-2x";
      break ;
    case 'Song':
      columnId = "#track-name";
      className = "bold-item";
      break;
    case 'Album':
      columnId = "#track-album";
      className = "bold-item";
      break;
    case 'Artist':
      columnId = "#track-artist";
      className = "bold-item";
      break;
    case 'Popularity':
      columnId = "#track-popularity";
      className = "bold-item";
      break;
  }
  $(columnId).toggleClass(className);

}

/*
  Given an array of track data, create the HTML for a Bootstrap row for each.
  Append each "row" to the container in the body to display all tracks.
*/
Trackster.renderTracks = function(tracks) {
  $('#song-list').empty();
  for ( var i = 0; i < tracks.length; i++) {
    var song_html =
'        <div class="row track">' +
'          <div class="col-xs-1" id="play-button">' +
'            <a href="' + tracks[i].preview_url + '" target="_blank">' +
'              <i class="fa fa-play-circle-o fa-2x" aria-hidden="true"></i>' +
'            </a>' +
'          </div>' +
'          <div class="col-xs-1">' + tracks[i].track_number + '</div>' +
'          <div class="col-xs-4">' + tracks[i].name + '</div>' +
'          <div class="col-xs-2">'+ tracks[i].artist_name + '</div>' +
'          <div class="col-xs-2">'+ tracks[i].album_name + '</div>' +
'          <div class="col-xs-2">'+ tracks[i].popularity + '</div>' +
'        </div>';

    $('#song-list').append(song_html);
  }
};

/*
  Given the spotify query result create an array of
  tracks.
*/
Trackster.generateTrackArray = function(items) {
  var tracks = [] ;
  for ( var i = 0; i < items.length; i++ ) {
    var track = {
      name: items[i].name,
      album_name: items[i].album.name,
      artist_name: items[i].artists[0].name,
      track_number: items[i].track_number,
      popularity: items[i].popularity,
      preview_url: items[i].preview_url
    }
    tracks.push(track) ;
  }
  return tracks;
}

/*
  Given a search term as a string, query the Spotify API.
  Render the tracks given in the API query response.
*/
Trackster.searchTracksByTitle = function(title) {
  $('.brand').toggleClass('brand-animate') ;
  var query_url = 'https://api.spotify.com/v1/search?query=' + title.toString() + '&type=track';
  var request = $.ajax({
    url: query_url,
    success: function(data){
      var tracks = Trackster.generateTrackArray(data.tracks.items);
      var $songList = $('#song-list') ;
      $songList.data("tracks", tracks) ;
      $songList.data("next_url", data.tracks.next); // maybe null
      $songList.data("prev_url", data.tracks.prev); // mayb$e null
      $songList.data("total_songs", data.tracks.total);
      Trackster.renderTracks(tracks);
      var prev_sel = $songList.data("sort-column");
      if (undefined != prev_sel && prev_sel !== null && prev_sel.length !== 0) {
        Trackster.toggleColumnSelection(prev_sel);
        $songList.data("sort-column", "");
      }

    },
    error: function(jqXHR, textStatus){
      alert("Request failed: " + textStatus) ;
      $('#song-list').empty();
    }
  });
  $('.brand').toggleClass('brand-animate') ;
};

Trackster.compareName = function(tracA, tracB) {
  var nameA = tracA.name.toUpperCase();
  var nameB = tracB.name.toUpperCase();
  return nameA.localeCompare(nameB);
};

Trackster.compareAlbum = function(tracA, tracB) {
  var nameA = tracA.album_name.toUpperCase();
  var nameB = tracB.album_name.toUpperCase();
  return nameA.localeCompare(nameB);
};

Trackster.compareArtist = function(tracA, tracB) {
  var nameA = tracA.artist_name.toUpperCase();
  var nameB = tracB.artist_name.toUpperCase();
  return nameA.localeCompare(nameB);
};

Trackster.compareTrackNumber = function(tracA, tracB) {
  return tracA.track_number - tracB.track_number ;
};

/* Want highest popularity first */
Trackster.comparePopularity = function(tracA, tracB) {
  return tracB.popularity - tracA.popularity;
};
