class MapManager {
  constructor() {
    this.map = {};
    this.home = {};
    this.addresses = JSON.parse(localStorage.getItem('addresses'));
  }
  initMap() {
    // Create a map object and specify the DOM element for display.
    // Later use the primary address from localStorage
    this.home = new google.maps.LatLng({
      lat: this.addresses[0].lat,
      lng: this.addresses[0].long
    })
    this.map = new google.maps.Map(document.getElementById('map'), {
      center: this.home,
      zoom: 13
    });
    
    // Do something only the first time the map is loaded
    google.maps.event.addListenerOnce(this.map, 'tilesloaded', this.displayPins());
  }
  displayPins() {
    this.addresses.map(address => {
      const latLang = new google.maps.LatLng({
        lat: address.lat,
        lng: address.long
      });
      const marker = new google.maps.Marker({
        position: latLang
      });
      marker.setMap(this.map);
    });
  }
}

const mapManager = new MapManager();