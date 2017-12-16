class UserManager {
  constructor() {
    this.name = '';
    this.email = '';
    this.uuid = '';
  }
  createUser() {
    firebase.auth().createUserWithEmailAndPassword(this.email, this.password).then(function() {
      $('#signup-modal').modal('close');
      this.signUserIn(this.email, this.password);
    }).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
    });
  }
  signUserIn() {
    firebase.auth().signInWithEmailAndPassword(this.email, this.password).then(function() {
      console.log('signed in user');
      // Close the modal
      $('#login-modal').modal('close');
      // Remove login buttons
      $('#user-login').remove();
  
      // Add user data to local state
      if (user != null) {
        this.email = user.email;
        this.uid = user.uid;
      }
    }).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
    });
  }
}

const userManager = new UserManager();