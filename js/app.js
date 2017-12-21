// Init database and user
firebase.initializeApp(config);
const database = firebase.database();

// Handle a new user logging in
$('#signup-form').submit(function(e) {
  e.preventDefault();
  userManager.email = $('#signup-email')
    .val()
    .trim();
  userManager.password = $('#signup-password')
    .val()
    .trim();

  // Validate input
  if (userManager.validateEmail() && userManager.validatePassword()) {
    userManager.createUser();
  }
});

// Hangle an existing user logging in
$('#login-form').submit(function(e) {
  console.log('login form submitted');
  e.preventDefault();
  userManager.email = $('#login-email')
    .val()
    .trim();
  userManager.password = $('#login-password')
    .val()
    .trim();

  userManager.signUserIn();
});

$('#user-login').on('click', '#logout', function() {
  userManager.signUserOut();
});

const writeAddressesFromDatabase = function(snapshot) {
  if (snapshot.val()) {
    if (snapshot.child(`users/${userManager.user.uid}/addresses`).exists()) {
      mapManager.addresses = snapshot
        .child(`users/${userManager.user.uid}`)
        .val().addresses;
    } else {
      mapManager.addresses = snapshot.val().addresses;
    }
    addressManager.writeAddresses();
  }
};

// Updates display if a child is updated
database.ref(`users`).on(
  'child_changed',
  function(snapshot) {
    writeAddressesFromDatabase(snapshot);
  },
  function(errorObject) {
    console.log('Failure: ' + errorObject.code);
  }
);

$('#submitAddress').click(function() {
  addressManager.saveAddress(
    $('#autocomplete').val(),
    $('#placelabel').val(),
    $('#isHome').prop('checked'),
    false,
    -1
  );
  $('#autocomplete').val('');
  $('#placelabel').val('');
  $('#isHome').prop('checked', false);
});

$('#searchDetails').on('click', 'li', function() {
  const idx = $(this).data('target');
  mapManager.moveToLocation(mapManager.addresses[idx]);
});

// Edit buttons next to addresses
$('body').on('click', '.smalleditbutton', function() {
  $('#autocompleteEdit').val(
    mapManager.addresses[$(this).attr('data-target')].address
  );
  $('#placelabelEdit').val(
    mapManager.addresses[$(this).attr('data-target')].label
  );
  $('#addressIndex').val($(this).attr('data-target'));
  if ($(this).attr('data-target') == 0) {
    $('#isHomeEdit').prop('checked', true);
  } else {
    $('#isHomeEdit').prop('checked', false);
  }
});

// Submit button for the edit panel - submits the changes and clears out the fields
$('#editButton').click(function() {
  addressManager.saveAddress(
    $('#autocompleteEdit').val(),
    $('#placelabelEdit').val(),
    $('#isHomeEdit').prop('checked'),
    true,
    $('#addressIndex').val()
  );
  $('#autocompleteEdit').val('');
  $('#placelabelEdit').val('');
  $('#isHomeEdit').prop('checked', false);
  $('#addressIndex').val('');
});

// Delete buttons
$('body').on('click', '.deletebutton', function() {
  addressManager.deleteAddress($(this).attr('data-target'));
});

// Listener for auth
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    userManager.showLogOutButton().addUserToLocalState();
  } else {
    console.log('no one is logged in');
  }
  database.ref().once('value', function(snapshot) {
    if (snapshot.child(`users/${userManager.user.uid}/addresses`).exists()) {
      writeAddressesFromDatabase(snapshot);
    }
    mapManager.setHome(snapshot).initMap();
  });
});

const getWeather = function() {
  var APIKey = '166a433c57516f51dfab1f7edaed8413';

  // Here we are building the URL we need to query the database
  var queryURL =
    'https://api.openweathermap.org/data/2.5/weather?' +
    'q=austin&units=imperial&appid=' +
    APIKey;

  // Here we run our AJAX call to the OpenWeatherMap API
  $.ajax({
    url: queryURL,
    method: 'GET'
  }).done(function(response) {
    // Transfer content to HTML
    $('#weather').html(
      `${response.name} ${Math.round(response.main.temp)} &deg; F, ${
        response.weather[0].description
      }`
    );
    $('#weather').css('textTransform', 'capitalize');
  });
};

function init() {
  const autocomplete = new google.maps.places.Autocomplete(
    /** @type {!HTMLInputElement} */ (document.getElementById('autocomplete')),
    { types: ['geocode'] }
  );

  const autocompleteEdit = new google.maps.places.Autocomplete(
    /** @type {!HTMLInputElement} */ (document.getElementById(
      'autocompleteEdit'
    )),
    { types: ['geocode'] }
  );

  getWeather();
}
