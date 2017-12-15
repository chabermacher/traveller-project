// Firebase config
//  var config = {
//    apiKey: "AIzaSyCkncjVkFvOunt8hcaWlDIMx9f1XbBLYIQ",
//    authDomain: "traveler-project-ca386.firebaseapp.com",
//    databaseURL: "https://traveler-project-ca386.firebaseio.com",
//    projectId: "traveler-project-ca386",
//    storageBucket: "",
//    messagingSenderId: "932064209486"
//  };
 
// firebase.initializeApp(config);

const GOOGLE_MAPS_KEY = 'AIzaSyCiHLoQIZp6HoFeFNzCOzrOm2H3sM3NXAo';
const initMap = function() {
  
  // Create a map object and specify the DOM element for display.
  // Uses the user's current geolocation data, but should later use the
  // primary address from localStorage
  var map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 30.2705365, lng: -97.7362387 },
    zoom: 8
  });
};

const showMap = function initializeMapInDOM() {
  const MAPS_BASE_URL = 'https://maps.googleapis.com/maps/api/js' + $.param({ key: GOOGLE_MAPS_KEY, callback: initMap });
  $.ajax({
    url: MAPS_BASE_URL,
    method: 'GET'
  }).done(function(response) {
    console.log(response); // This logs an error, but the map displays fine
  });
}