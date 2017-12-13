function initMap(geolocation) {
  // Checks if user's browser supports geolocation
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var geolocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      var circle = new google.maps.Circle({
        center: geolocation,
        radius: position.coords.accuracy
      });
      // Create a map object and specify the DOM element for display.
      var map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: geolocation.lat, lng: geolocation.lng},
        zoom: 8
      });
    });
  }
}

const showMap = function initializeMapInDOM() {
  const MAPS_BASE_URL = 'https://maps.googleapis.com/maps/api/js' + $.param({ key: GOOGLE_MAPS_KEY, callback: initMap });
  $.ajax({
    url: MAPS_BASE_URL,
    method: 'GET'
  }).done(function(response) {
    console.log(response); // This logs an error, but the map displays fine
  });
}