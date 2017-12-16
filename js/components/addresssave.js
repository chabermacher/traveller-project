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

// ---------------FUNCTIONS-----------------------

// Takes the autocompleted address, makes a call to Google Maps Geocoder API, 
// And stores the formatted address string, latitude, and longitude in an 
// object that is pushed to the addresses array stored in localStorage
function saveAddress(addressString, label, isHome) {
    let addressParam = addressString.replace(/ /g,"+");
    let APIURL = "https://maps.googleapis.com/maps/api/geocode/json?address=" + addressParam + "&key=" + GOOGLE_MAPS_KEY;
    $.get(APIURL).done(function(response){
        storeAddress(response, label, isHome);
    });

};

// Writes all addresses in the the "address" array to the right side of the page

function writeAddresses() {
    let addressArray = JSON.parse(localStorage.getItem("addresses"));
    $("#searchDetails").empty();
    addressArray.forEach(function(object, index){
        let icon;
        let address = object.address.replace(",",",<br>")
        address = address.replace(", USA", "");
        if (index === 0) {
            icon = "home"
        }
        else {
            icon = "place"
        }
        $("#searchDetails").append(`
            <li data="` + index + `">
                <div class="collapsible-header">
                    <i class="material-icons">` + icon + `</i>` + object.label + `</div>
                <div class="collapsible-body">
                    <span>` + address + `</span>
                </div>
            </li>
        `);
    });
}

// This function adds ONLY the most recently saved address to the page (so that the whole list
// of addresses don't have to be rewritten)

function initializePage() {
    if (localStorage.getItem("addresses")) {
        writeAddresses();
    }
    else {
        localStorage.setItem("addresses", "[]")
    }
}

// Takes the result from the Google Maps Geocoder API and stores it in localStorage
// IF the addresses array already exists in localStorage (addresses have already been added),
// That array is pulled down, and the new address is pushed into it, then put back into local Storage

function storeAddress(object, placelabel, isHome) {
    
    let addressArray = JSON.parse(localStorage.getItem("addresses"));
    // If the user has selected the "Home" checkbox, this is added to the BEGINNING of the array
    if (isHome) {
        addressArray.unshift({
            address: object.results[0].formatted_address,
            label: placelabel,
            lat: object.results[0].geometry.location.lat,
            long: object.results[0].geometry.location.lng
        });
        // Now that new address has been added to array, write the array to localStorage
        localStorage.setItem("addresses", JSON.stringify(addressArray));
    }
    // Else it's added to the END of the Array
    else {
        addressArray.push({
            address: object.results[0].formatted_address,
            label: placelabel,
            lat: object.results[0].geometry.location.lat,
            long: object.results[0].geometry.location.lng
        });
        // Now that new address has been added to array, write the array to localStorage
        localStorage.setItem("addresses", JSON.stringify(addressArray));
    }
    // Write all addresses to the page
    writeAddresses();
};

// ---------------EVENT LISTENERS-----------------

// When the user clicks the submit button, the saveAddress function is passed the values for
// the address, the label, and the boolean of the "Is this your home address" checkbox
$("#submitAddress").click(function() {
    saveAddress($("#autocomplete").val(), $("#placelabel").val(), $('#isHome').prop('checked'));
    $("#autocomplete").val('');
    $("#placelabel").val('');
    $('#isHome').prop('checked', false);
})

// NEED TO ADD FUNCTION FOR "SAVE" BUTTON WHEN EDITING AN EXISTING ADDRESS

// -----------------RUN ON PAGELOAD----------------
initializePage();

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
initMap();
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

