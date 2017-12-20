// Handle a new user logging in
$('#signup-form').submit(function(e) {
  console.log('sign up form submitted');
  e.preventDefault();
  userManager.email = $('#signup-email').val().trim();
  userManager.password = $('#signup-password').val().trim();

  // Validate input
  if (userManager.validateEmail() && userManager.validatePassword()) {
    userManager.createUser();
  }
});

// Hangle an existing user logging in
$('#login-form').submit(function(e) {
  console.log('login form submitted');
  e.preventDefault();
  userManager.email = $('#login-email').val().trim();
  userManager.password = $('#login-password').val().trim();

  userManager.signUserIn();
});

$('#user-login').on('click', '#logout', function() {
  userManager.signUserOut();
});

$('#searchDetails').on('click', 'li', function() {
  const idx = $(this).data('target');
  mapManager.moveToLocation(mapManager.addresses[idx]);
});