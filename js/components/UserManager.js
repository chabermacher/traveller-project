class UserManager {
  constructor() {
    this.user = {};
  }
  addUserToLocalState() {
    // Add user data to local state
    this.user = firebase.auth().currentUser;
  }
  validateEmail() {
    if (
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(userManager.email)
    ) {
      return true;
    } else {
      return false;
    }
  }
  validatePassword() {
    if (/^[A-Za-z]\w{7,14}$/.test(userManager.password)) {
      return true;
    } else {
      return false;
    }
  }
  showLogOutButton() {
    $('#user-login').html(`
      <a class="waves-effect waves-light btn blue" id="logout">Log Out</a>
    `);
    return this;
  }
  signUserIn() {
    firebase
      .auth()
      .signInWithEmailAndPassword(this.email, this.password)
      .then(function() {
        // Close the modal
        $('#login-modal').modal('close');
        // Replace login buttons with Sign Out button
        this.showLogOutButton();
        // Add user data to local state
        this.addUserToLocalState();
      })
      .catch(function(error) {
        // Display error message in appropriate modal
        $('#login-error').text(error.message);
      });
  }
  signUserOut() {
    firebase
      .auth()
      .signOut()
      .then(() => location.reload())
      .catch(() => console.log(error.message));
  }
  createUser() {
    firebase
      .auth()
      .createUserWithEmailAndPassword(this.email, this.password)
      .catch(() => $('#signup-error').text(error.message))
      .then(() => {
        // Add user data to local state
        this.addUserToLocalState();
        // Add user to database
        firebase
          .database()
          .ref('users')
          .child(`${this.user.uid}`)
          .set({
            email: this.user.email
          });
        $('#signup-modal').modal('close');
        this.signUserIn();
      });
  }
}

const userManager = new UserManager();
