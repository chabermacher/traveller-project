class MapManager {
  constructor() {
    this.map = {};
    this.home = {};
    this.addresses = [];
  }
  initMap() {
    // Create a map object and specify the DOM element for display.
    this.map = new google.maps.Map(document.getElementById('map'), {
      center: this.home,
      zoom: 13
    });
    
    // Do something only the first time the map is loaded
    google.maps.event.addListenerOnce(this.map, 'tilesloaded', this.displayPins());
  }
  // Sets the home coordinates to the stored home address, or general Austin if none
  setHome(snapshot) {
    let homeCoords = {};
    if (snapshot.val()) {
      homeCoords = {
        lat: this.addresses[0].lat,
        lng: this.addresses[0].long
      }
    }
    else {
      homeCoords = {
        lat: 30.3074624,
        lng: -98.0335911
      }
    }
    // Sets home coordinates as Google LatLng object which is later used in 
    // initMap to center it on that location
    this.home = new google.maps.LatLng(homeCoords);
  }
  displayPins() {
    // Only displays pins if addresses exist in local array
    if (this.addresses.length > 0) {
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
}

const mapManager = new MapManager();