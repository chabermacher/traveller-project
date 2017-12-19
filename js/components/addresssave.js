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

// -----------INITIALIZE FIREBASE-----------------
firebase.initializeApp(config);

// ---------------VARIABLES-----------------------
var database = firebase.database();
// This variable will be updated to match the array in Firebase every time Firebase is updated
mapManager.addresses = [];


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
    }).then(function() {
        mapManager
            .clearPins()
            .setPins()
            .displayPins(mapManager.map);
    });
};

// Writes all addresses in the the "address" array to the right side of the page

function writeAddresses() {
    $("#searchDetails").empty();
    mapManager.addresses.forEach(function(object, index){
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
            <li data-target="${index}">
                <div class="collapsible-header address-drilldown">
                    <div>
                        <i class="material-icons">${icon}</i>${object.label}
                    </div>
                    <div>
                        <span class="travelTime" id="travel${index}"></span>
                    </div>
                    <div>
                        <a data="${index}" class="waves-effect waves-light btn modal-trigger blue smalleditbutton" href="#modal2">Edit</a>
                    </div>
                </div>
                <div class="collapsible-body">
                    <span>${address}</span>
                                         
                      <button data-target="nearby-${index}" class="btn modal-trigger">Modal</button>
                      
                      <div id="nearby-${index}" class="modal bottom-sheet">
                        <div class="modal-content nearby">
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
        // Add the travel time for each non-home address (from home to the address)
            if (index !== 0) {
                travelTime.getTime(mapManager.addresses[0].lat, mapManager.addresses[0].long, object.lat, object.long, index)
            }

        // the "href" attribute of the modal trigger must specify the modal ID that wants to be triggered
        $('.modal').modal();
        
    });

    //Button click function to call nearby.js to grab restaurants and populate modal.
    mapManager.addresses.forEach(function(object, index){
        $(`button[data-target="nearby-${index}"]`).click(function() {
          nearby(object);
        })
    });
}

function editAddress(index, object, placelabel, isHome) {
    mapManager.addresses[index].address = object.results[0].formatted_address;
    mapManager.addresses[index].label = placelabel;
    mapManager.addresses[index].lat = object.results[0].geometry.location.lat;
    mapManager.addresses[index].long =object.results[0].geometry.location.lng;
    if (isHome) {
        let removed = mapManager.addresses.splice(index, 1);
        mapManager.addresses.unshift(removed[0]);
        // Because of how the map is initialized, this does not currently work
        // mapManager.setHome();
        database.ref().set({"addresses": JSON.stringify(mapManager.addresses)});
    }
    else {
        database.ref().set({"addresses": JSON.stringify(mapManager.addresses)});
    }
};


// This function initializes the page - if there is address data in Firebase, it's written to
// the page. Else, a blank address array is written to firebase.


// function initializePage() {

//     database.ref('addresses').once('value').then(function(snapshot){
//         if (snapshot.val() !== undefined) {
//             writeAddresses();
//             mapManager.addresses = JSON.parse(snapshot.val())
//         }
//         else {
//             database.ref().set({addresses: "[]"});
//             mapManager.addresses = [];
//         }
//     });    
// }
// This function sets the global mapManager.addresses variable equal to the array passed as an argument
// function pullInAddresses(array) {
//     mapManager.addresses = array;
// };

// Takes the result from the Google Maps Geocoder API and stores it in Firebase

function storeAddress(object, placelabel, isHome) {
    
    // If the user has selected the "Home" checkbox, this is added to the BEGINNING of the array
    if (isHome) {
        mapManager.addresses.unshift({
            address: object.results[0].formatted_address,
            label: placelabel,
            lat: object.results[0].geometry.location.lat,
            long: object.results[0].geometry.location.lng
        });
        // Now that new address has been added to array, write the array to Firebase
        database.ref().set({"addresses": JSON.stringify(mapManager.addresses)});
    }
    // Else it's added to the END of the Array
    else {
        mapManager.addresses.push({
            address: object.results[0].formatted_address,
            label: placelabel,
            lat: object.results[0].geometry.location.lat,
            long: object.results[0].geometry.location.lng
        });
        // Now that new address has been added to array, write the array to Firebase
        database.ref().set({"addresses": JSON.stringify(mapManager.addresses)});
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
        mapManager.addresses = array;
        writeAddresses();
    }
    else {
        database.ref().set({addresses: "[]"});
        mapManager.addresses = [];
        }
  }, function(errorObject) {
    console.log("Failure: " + errorObject.code)
  });

// Edit buttons next to addresses
$("body").on("click", ".smalleditbutton", function() {
    $("#autocompleteEdit").val(mapManager.addresses[$(this).attr("data")].address);
    $("#placelabelEdit").val(mapManager.addresses[$(this).attr("data")].label);
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

    // Sets home and initializes map
    // This listener is not a good solution and is only here so the map and home location
    // can be initialized once data is loaded from Firebase. Without it, the event listener
    // on initial DB load may not have completed yet, resulting in an empty local array
    database.ref().once('value', function(snapshot) {
        mapManager.setHome(snapshot).initMap();
    });
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

