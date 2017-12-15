// These are used to temporarily test other functionality that needed addresses
// Later this will be pulled from localStorage
const savedAddresses = [
  {
    address: '1704 McCall Rd, Austin, TX 78703',
    lat: 30.2910983,
    lng: -97.7662439
  },
  {
    address: '6317 Bee Caves Rd #380, Austin, TX 78746',
    lat: 30.2962126,
    lng: -97.8349851
  }
];

function initMap() {
  // Create a map object and specify the DOM element for display.
  // Later use the primary address from localStorage
  var map = new google.maps.Map(document.getElementById('map'), {
    center: {
      lat: 30.2705365,
      lng: -97.7362387
    },
    zoom: 8
  });
  // Do something only the first time the map is loaded
  google.maps.event.addListenerOnce(map, 'tilesloaded', function() {
    // Add pins for each of the addresses that are saved in localStorage.
    // `savedAddresses` is defined in main app.js file so can be used elsewhere
    savedAddresses.map(address => {
      const latLang = new google.maps.LatLng({
        lat: address.lat,
        lng: address.lng
      });
      const marker = new google.maps.Marker({
        position: latLang
      });
      marker.setMap(map);
    });
  });
}
