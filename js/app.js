// Handle a new user logging in
$('#signup-form').submit(function(e) {
  console.log('sign up form submitted');
  e.preventDefault();
  userManager.email = $('#signup-email').val().trim();
  userManager.password = $('#signup-password').val().trim();

  // Validate input

  // Create a user in database
  userManager.createUser();
});

// Hangle an existing user logging in
$('#login-form').submit(function(e) {
  console.log('login form submitted');
  e.preventDefault();
  userManager.email = $('#login-email').val().trim();
  userManager.password = $('#login-password').val().trim();

  userManager.signUserIn();
});