// This component contains all the functionality required for the user to enter in
// an address and save it to the application. This entails:
// 1. An an address field for which Google will return autocomplete suggestions
// 2. Making an API call to Google's Geocoding API to also store that address' lat/long values
// 3. Storing the address in the user's localStorage to be used by the application

// The following script tags need to be added to the HTML for this to work:
/* <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
<script src="traveller-project/js/addressautocomplete.js"></script> */
/* <script src="https://maps.googleapis.com/maps/api/js?key=API_KEY&libraries=places&callback=initAutocomplete"
async defer></script> */

// Further, there needs to be a search field with the id "autocomplete" for this to work
// Extra comment

$(document).ready(function() {

// -----------INITIALIZE FIREBASE-----------------
firebase.initializeApp(config);

// ---------------VARIABLES-----------------------
var database = firebase.database();
// This variable will be updated to match the array in Firebase every time Firebase is updated
var localAddressArray = [];


// ---------------FUNCTIONS-----------------------

// Takes the autocompleted address, makes a call to Google Maps Geocoder API, 
// And stores the formatted address string, latitude, and longitude in an 
// object that is pushed to the addresses array stored in Firebase
function saveAddress(addressString, label, isHome, isEdit, isEditIndex) {
    let addressParam = addressString.replace(/ /g,"+");
    let APIURL = "https://maps.googleapis.com/maps/api/geocode/json?address=" + addressParam + "&key=" + GOOGLE_MAPS_KEY;
    $.get(APIURL).done(function(response){
        if (isEdit) {
            editAddress(isEditIndex, response, label, isHome);
        }
        else {
            storeAddress(response, label, isHome);
        }
    });
};

// Writes all addresses in the the "address" array to the right side of the page

function writeAddresses() {
    $("#searchDetails").empty();
    localAddressArray.forEach(function(object, index){
        let icon;
        let address = object.address.replace(",",",<br>");
        address = address.replace(", USA", "");
        if (index === 0) {
            icon = "home";
        }
        else {
            icon = "place";
        }
        $("#searchDetails").append(`
            <li data="${index}">
                <div class="collapsible-header">
                    <i class="material-icons">${icon}</i>${object.label}&nbsp;&nbsp;<a data="${index}" class="waves-effect waves-light btn modal-trigger blue smalleditbutton" href="#modal2">Edit</a></div>
                <div class="collapsible-body">
                    <span>${address}</span>
                                         
                      <button data-target="nearby-${index}" class="btn modal-trigger">Modal</button>
                      
                      <div id="nearby-${index}" class="modal bottom-sheet">
                        <div class="modal-content">
                          <h4>Modal Header</h4>
                          <p>A bunch of text</p>
                        </div>
                        <div class="modal-footer">
                          <a href="#!" class="modal-action modal-close waves-effect waves-green btn-flat">Close</a>
                        </div>
                      </div>;
                                          
                </div>
            </li>

        `);
        // the "href" attribute of the modal trigger must specify the modal ID that wants to be triggered
        $('.modal').modal();
        
    });
}

function editAddress(index, object, placelabel, isHome) {
    localAddressArray[index].address = object.results[0].formatted_address;
    localAddressArray[index].label = placelabel;
    localAddressArray[index].lat = object.results[0].geometry.location.lat;
    localAddressArray[index].long =object.results[0].geometry.location.lng;
    if (isHome) {
        let removed = localAddressArray.splice(index, 1);
        localAddressArray.unshift(removed[0]);
        database.ref().set({"addresses": JSON.stringify(localAddressArray)});
    }
    else {
        database.ref().set({"addresses": JSON.stringify(localAddressArray)});
    }
};


// This function initializes the page - if there is address data in Firebase, it's written to
// the page. Else, a blank address array is written to firebase.


// function initializePage() {

//     database.ref('addresses').once('value').then(function(snapshot){
//         if (snapshot.val() !== undefined) {
//             writeAddresses();
//             localAddressArray = JSON.parse(snapshot.val())
//         }
//         else {
//             database.ref().set({addresses: "[]"});
//             localAddressArray = [];
//         }
//     });    
// }
// This function sets the global localAddressArray variable equal to the array passed as an argument
// function pullInAddresses(array) {
//     localAddressArray = array;
// };

// Takes the result from the Google Maps Geocoder API and stores it in Firebase

function storeAddress(object, placelabel, isHome) {
    
    // If the user has selected the "Home" checkbox, this is added to the BEGINNING of the array
    if (isHome) {
        localAddressArray.unshift({
            address: object.results[0].formatted_address,
            label: placelabel,
            lat: object.results[0].geometry.location.lat,
            long: object.results[0].geometry.location.lng
        });
        // Now that new address has been added to array, write the array to Firebase
        database.ref().set({"addresses": JSON.stringify(localAddressArray)});
    }
    // Else it's added to the END of the Array
    else {
        localAddressArray.push({
            address: object.results[0].formatted_address,
            label: placelabel,
            lat: object.results[0].geometry.location.lat,
            long: object.results[0].geometry.location.lng
        });
        // Now that new address has been added to array, write the array to Firebase
        database.ref().set({"addresses": JSON.stringify(localAddressArray)});
    }
    // Write all addresses to the page
    // writeAddresses();
};

// function testStorage() {
//     // database.ref().set({addresses: "test123"});
//     let something;
//     database.ref('addresses').once('value').then(function(snapshot){
//         something = snapshot.val();
//         console.log(something + "something")
//         console.log(snapshot.val() + "val");
//     });
//     console.log(something + "something outside");
// };

// ---------------EVENT LISTENERS-----------------

// When the user clicks the submit button, the saveAddress function is passed the values for
// the ADDRESS, the LABEL, the BOOLEAN of the "Is this your home address" checkbox, 
// the "isEdit" BOOLEAN that is only true when the user is editing an existing address, and
// the INDEX of the existing address, if an address is being edited
$("#submitAddress").click(function() {
    saveAddress($("#autocomplete").val(), $("#placelabel").val(), $('#isHome').prop('checked'), false, -1);
    $("#autocomplete").val('');
    $("#placelabel").val('');
    $('#isHome').prop('checked', false);
});


// This both initializes the page AND updates the application when a new address is added to Firebase
database.ref('addresses').on("value", function(snapshot) {
    let array = JSON.parse(snapshot.val());
    if (snapshot.val() !== null) {
        console.log(array);
        localAddressArray = array;
        writeAddresses();
    }
    else {
        database.ref().set({addresses: "[]"});
        localAddressArray = [];
    }
  }, function(errorObject) {
    console.log("Failure: " + errorObject.code)
  });

// Edit buttons next to addresses
$("body").on("click", ".smalleditbutton", function() {
    $("#autocompleteEdit").val(localAddressArray[$(this).attr("data")].address);
    $("#placelabelEdit").val(localAddressArray[$(this).attr("data")].label);
    $("#addressIndex").val($(this).attr("data"));
    if ($(this).attr("data") == 0){
        $("#isHomeEdit").prop('checked', true);
    }
    else {
        $("#isHomeEdit").prop('checked', false);
    }
});

// Submit button for the edit panel - submits the changes and clears out the fields
$("#editButton").click(function() {
    saveAddress($("#autocompleteEdit").val(), $("#placelabelEdit").val(), $('#isHomeEdit').prop('checked'), true, $("#addressIndex").val());
    $("#autocompleteEdit").val('');
    $("#placelabelEdit").val('');
    $('#isHomeEdit').prop('checked', false);
    $("#addressIndex").val('');
});

// -----------------RUN ON PAGELOAD----------------
// initializePage();

});
// --------GOOGLE ADDRESS AUTOCOMPLETE FUNCTIONALITY BELOW--------

// This example displays an address form, using the autocomplete feature
// of the Google Places API to help users fill in the information.

// This example requires the Places library. Include the libraries=places
// parameter when you first load the API. For example:
// <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places">

var placeSearch, autocomplete;
var componentForm = {
street_number: 'short_name',
route: 'long_name',
locality: 'long_name',
administrative_area_level_1: 'short_name',
country: 'long_name',
postal_code: 'short_name'
};

function initAutocomplete() {
// Create the autocomplete object, restricting the search to geographical
// location types.

autocomplete = new google.maps.places.Autocomplete(
    /** @type {!HTMLInputElement} */(document.getElementById('autocomplete')),
    {types: ['geocode']});

autocomplete2 = new google.maps.places.Autocomplete(
    /** @type {!HTMLInputElement} */(document.getElementById('autocompleteEdit')),
    {types: ['geocode']});

// When the user selects an address from the dropdown, populate the address
// fields in the form.
// autocomplete.addListener('place_changed', fillInAddress);

// Calls the function to initialize the map
mapManager.initMap();
}

// function fillInAddress() {
//     // Get the place details from the autocomplete object.
//     var place = autocomplete.getPlace();

//     for (var component in componentForm) {
//         document.getElementById(component).value = '';
//         document.getElementById(component).disabled = false;
//     }

//     // Get each component of the address from the place details
//     // and fill the corresponding field on the form.
//     for (var i = 0; i < place.address_components.length; i++) {
//         var addressType = place.address_components[i].types[0];
//         if (componentForm[addressType]) {
//         var val = place.address_components[i][componentForm[addressType]];
//         document.getElementById(addressType).value = val;
//         }
//     }
// }

// Bias the autocomplete object to the user's geographical location,
// as supplied by the browser's 'navigator.geolocation' object.
// function geolocate() {
//     if (navigator.geolocation) {
//         navigator.geolocation.getCurrentPosition(function(position) {
//         var geolocation = {
//             lat: position.coords.latitude,
//             lng: position.coords.longitude
//         };
//         var circle = new google.maps.Circle({
//             center: geolocation,
//             radius: position.coords.accuracy
//         });
//         autocomplete.setBounds(circle.getBounds());
//         });
//     }
// }

