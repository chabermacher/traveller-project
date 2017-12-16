class UserManager {
  constructor() {
    this.name = '';
    this.email = '';
    this.uid = '';
  }
  addUserToLocalState() {
    // Add user data to local state
    const user = firebase.auth().currentUser;
    if (user != null) {
      this.email = user.email;
      this.uid = user.uid;
    }
  }
  validateEmail() {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(userManager.email)) {  
      return true;
    } else {
      return false;
    }
  }
  validatePassword() {
    if(/^[A-Za-z]\w{7,14}$/.test(userManager.password)) {
      return true;
    } else {
      return false;
    }
  }
  signUserIn() {
    firebase.auth().signInWithEmailAndPassword(this.email, this.password).then(function() {
      console.log('signed in user');
      // Close the modal
      $('#login-modal').modal('close');
      // Replace login buttons with Sign Out button
      $('#user-login').html(`
        <a class="waves-effect waves-light btn blue" id="logout">Log Out</a>
      `);
  
      // Add user data to local state
      this.addUserToLocalState();

      // Store uid in cookies so user will be logged in on next visit
    }).catch(function(error) {
      // Display error message in appropriate modal
      $('#login-error').text(error.message);
    });
  }
  signUserOut() {
    console.log('logging user out');
    firebase.auth().signOut().then(function() {
      // Sign-out successful
      location.reload();
    }).catch(function(error) {
      console.log(error.message);
    });
  }
  createUser() {
    console.log('creating user');
    firebase.auth().createUserWithEmailAndPassword(this.email, this.password).catch(function(error) {
      // Display error message in appropriate modal
      $('#signup-error').text(error.message);
    }).then(() => {
      // Add user data to local state
      this.addUserToLocalState();

      // Add user to database
      firebase.database().ref('users').set({
        email: this.email,
        uid: this.uid
      });
      $('#signup-modal').modal('close');
      this.signUserIn(this.email, this.password);
    });
  }
}

const userManager = new UserManager();