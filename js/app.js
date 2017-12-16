const userManager = new UserManager();

$('#signup-form').submit(function(e) {
  console.log('sign up form submitted');
  e.preventDefault();
  userManager.email = $('#signup-email').val().trim();
  userManager.password = $('#signup-password').val().trim();

  // Validate input

  // Create a user in database
  userManager.createUser();
});

// Sign in
$('#login-form').submit(function(e) {
  console.log('login form submitted');
  e.preventDefault();
  userManager.email = $('#login-email').val().trim();
  userManager.password = $('#login-password').val().trim();

  userManager.signUserIn();
});