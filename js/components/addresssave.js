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

const user = firebase.auth().currentUser;

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
        mapManager.displayPins();
    });
};

function editAddress(index, object, placelabel, isHome) {
    mapManager.addresses[index].address = object.results[0].formatted_address;
    mapManager.addresses[index].label = placelabel;
    mapManager.addresses[index].lat = object.results[0].geometry.location.lat;
    mapManager.addresses[index].long =object.results[0].geometry.location.lng;
    if (isHome) {
        let removed = mapManager.addresses.splice(index, 1);
        mapManager.addresses.unshift(removed[0]);
        database.ref().set({"addresses": JSON.stringify(mapManager.addresses)});
    }
    else {
        database.ref().set({"addresses": JSON.stringify(mapManager.addresses)});
    }
};

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
            <li data="${index}">
                <div class="collapsible-header address-drilldown">
                    <div>
                        <i class="material-icons">${icon}</i>${object.label}
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
    if (snapshot.val() !== null) {
        if (user) {
            const addresses = database.ref('users').child(`${user.uid}`).val().addresses;
            console.log(addresses);
            mapManager.addresses = addresses;
            writeAddresses();
        }
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

function init() {
    // --------GOOGLE ADDRESS AUTOCOMPLETE FUNCTIONALITY BELOW--------
    
    // This example displays an address form, using the autocomplete feature
    // of the Google Places API to help users fill in the information.

    // Create the autocomplete object, restricting the search to geographical
    // location types.
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

    database.ref('addresses').once('value', function(snapshot) {
        // Sets what home should be - an existing home, or Austin if none
        mapManager.setHome(snapshot);
        // Calls the function to initialize the map
        mapManager.initMap();
    });
}