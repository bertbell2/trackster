var TracksterTests = {};

TracksterTests.runAllTracksterTests = function() {
  var errors = [];
  TracksterTests.testSearchTracksByTitle(errors);
  TracksterTests.testRenderTracks(errors);
  TracksterTests.logErrors(errors);
};

TracksterTests.testRenderTracks = function(errors) {
  var hasRenderTracks = Trackster.renderTracks && typeof Trackster.renderTracks === 'function';
  if (!hasRenderTracks) {
    errors.push("renderTracks: Trackster object should have a function called renderTracks.");
    // If renderTracks method is missing, remaining tests will not work.
    return;
  }

  var userHtml = $('body').html();

  var tinyDancerTracks = [{
    preview_url: 'https://p.scdn.co/mp3-preview/bfc5158b3ab22e89b1f1d4d73c105f853439971e',
    name: 'Tiny Dancer',
    artists: [{name: 'Elton John'}],
    album: {name: 'Madman Across The Water'},
    popularity: 61
  }];
  Trackster.renderTracks(tinyDancerTracks);
  if (!$("a[href='https://p.scdn.co/mp3-preview/bfc5158b3ab22e89b1f1d4d73c105f853439971e']").length) {
    errors.push("renderTracks: renderTracks should add an <a> tag link to each track's preview url.");
  }
  if (!$("body:contains('Tiny Dancer')").length) {
    errors.push("renderTracks: renderTracks should add each track's name to the track list.");
  }
  if (!$("body:contains('Elton John')").length) {
    errors.push("renderTracks: renderTracks should add each track's artist's name to the track list.");
  }
  if (!$("body:contains('Madman Across The Water')").length) {
    errors.push("renderTracks: renderTracks should add each track's album's name to the track list.");
  }
  if (!$("body:contains('61')").length) {
    errors.push("renderTracks: renderTracks should add each track's popularity to the track list.");
  }

  Trackster.renderTracks([]);
  if ($("body:contains('Tiny Dancer')").length) {
    errors.push("renderTracks: renderTracks should empty the HTML of the track list before rendering a new list of tracks.");
  }

  $('body').html(userHtml);
};

TracksterTests.testSearchTracksByTitle = function(errors) {
  var hasSearchTracksByTitle = Trackster.searchTracksByTitle && typeof Trackster.searchTracksByTitle === 'function';
  if (!hasSearchTracksByTitle) {
    errors.push("searchTracksByTitle: Trackster object should have a function called searchTracksByTitle.");
    // If searchTracksByTitle method is missing, remaining tests will not work.
    return;
  }

  var mockAjax = TracksterTests.mock($, 'ajax');

  Trackster.searchTracksByTitle('tiny');

  if (!mockAjax.getCalls().length) {
    errors.push("searchTracksByTitle: searchTracksByTitle should call $.ajax.");
  } else {
    var url, successFn;
    var call = mockAjax.getCalls()[0];
    if (typeof call[0] === 'string') {
      url = call[0];
      successFn = call[1] && call[1].success;
    } else {
      url = call[0] && call[0].url;
      successFn = call[0] && call[0].success;
    }

    if (!url) {
      errors.push('searchTracksByTitle: $.ajax must specify a "url" parameter.');
    } else {
      var match = url.match('api.spotify.com/v1/search\\?(.*)');
      if (!match) {
        errors.push("searchTracksByTitle: $.ajax url should hit the https://api.spotify.com/v1/search? endpoint.");
      } else {
        params = match[1].split('&');
        if (params.length < 2) {
          errors.push('searchTracksByTitle: $.ajax url should have parameters for "type" and "q" separated by an "&".');
        } else {
          if (!params.includes('type=track')) {
            errors.push('searchTracksByTitle: $.ajax url should have a parameter called "type" with a value of "track".');
          }
          if (!params.includes('q=tiny')) {
            errors.push('searchTracksByTitle: $.ajax url should have a parameter called "q" with a value of the supplied title parameter.');
          }
        }
      }
    }

    if (!successFn) {
      errors.push('searchTracksByTitle: $.ajax must specify a "success" parameter.');
    } else {
      var mockRender = TracksterTests.mock(Trackster, 'renderTracks');
      var mockItems = ['Tiny Dancer'];
      var response = {
        tracks: {
          items: mockItems
        }
      };
      successFn(response);
      if (!mockRender.getCalls().length) {
        errors.push('searchTracksByTitle: "success" callback should call Trackster.renderTracks().');
      } else if (mockRender.getCalls()[0][0] !== mockItems) {
        errors.push("searchTracksByTitle: Trackster.renderTracks() should be called with data located in the returned response's `track.items`.");
      }
      mockRender.restore();
    }
  }
  mockAjax.restore();
};

TracksterTests.mock = function(object, functionName) {
  var oldFn = object[functionName];
  var calls = [];
  object[functionName] = function() {
    calls.push(Array.prototype.slice.apply(arguments));
  };
  return {
    restore: function() {
      object[functionName] = oldFn;
    },
    getCalls: function() {
      return calls;
    }
  };
};

TracksterTests.logErrors = function(errors) {
  if (errors.length === 0) {
    console.log('%cAll TracksterTests passed!', 'color: #30AD35');
  } else {
    errors = new Set(errors);
    var errorMessage = ' errors found:';
    if (errors.size === 1) {
      errorMessage = ' error found:';
    }
    console.log('%c' + errors.size + ' ' + errorMessage, 'color: #BA1222');
    errors.forEach(function(error) {
      console.log('%c  ' + error, 'color: #BA1222');
    });
  }
};