// This component contains all the functionality required for the user to enter in
// an address and save it to the application. This entails:
// 1. An an address field for which Google will return autocomplete suggestions
// 2. Making an API call to Google's Geocoding API to also store that address' lat/long values
// 3. Storing the address in the user's localStorage to be used by the application

class AddressManager {
  saveAddress(addressString, label, isHome, isEdit, isEditIndex) {
    let addressParam = addressString.replace(/ /g, '+');
    let APIURL =
      'https://maps.googleapis.com/maps/api/geocode/json?address=' +
      addressParam +
      '&key=' +
      GOOGLE_MAPS_KEY;
    $.get(APIURL)
      .done(response => {
        if (isEdit) {
          this.editAddress(isEditIndex, response, label, isHome);
        } else {
          this.storeAddress(response, label, isHome);
        }
      })
      .then(function() {
        mapManager
          .clearPins()
          .setPins()
          .displayPins(mapManager.map);
      });
  }
  editAddress(index, object, placelabel, isHome) {
    mapManager.addresses[index].address = object.results[0].formatted_address;
    mapManager.addresses[index].label = placelabel;
    mapManager.addresses[index].lat = object.results[0].geometry.location.lat;
    mapManager.addresses[index].long = object.results[0].geometry.location.lng;
    if (isHome) {
      let removed = mapManager.addresses.splice(index, 1);
      mapManager.addresses.unshift(removed[0]);
    }
    database
      .ref('users')
      .child(`${userManager.user.uid}`)
      .update({ addresses: mapManager.addresses });
  }
  // Takes the result from the Google Maps Geocoder API and stores it in Firebase
  storeAddress(object, placelabel, isHome) {
    // If the user has selected the "Home" checkbox, this is added to the BEGINNING of the array
    if (isHome) {
      mapManager.addresses.unshift({
        address: object.results[0].formatted_address,
        label: placelabel,
        lat: object.results[0].geometry.location.lat,
        long: object.results[0].geometry.location.lng
      });
    } else {
      // Else it's added to the END of the Array
      mapManager.addresses.push({
        address: object.results[0].formatted_address,
        label: placelabel,
        lat: object.results[0].geometry.location.lat,
        long: object.results[0].geometry.location.lng
      });
    }
    // Now that new address has been added to array, write the array to Firebase
    if (userManager.user) {
      database
        .ref(`users/${userManager.user.uid}`)
        .update({ addresses: mapManager.addresses });
    } else {
      console.log('no user to add addresses to!');
    }
  }
  // Writes all addresses in the the "address" array to the right side of the page
  writeAddresses() {
    if (mapManager.addresses.length > 0) {
      $('#searchDetails').empty();
      mapManager.addresses.forEach((object, index) => {
        let icon;
        let address = object.address.replace(',', ',<br>');
        address = address.replace(', USA', '');
        if (index === 0) {
          icon = 'home';
        } else {
          icon = 'place';
        }
        $('#searchDetails').append(`
          <li data-target="${index}">
            <div class="collapsible-header address-drilldown">
              <div>
                <i class="material-icons">${icon}</i>${object.label}
              </div>
              <div>
                <span class="travelTime" id="travel${index}"></span>
              </div>
            </div>
            <div class="collapsible-body">
              <div class="address-container">
                <div class="address">
                  <div>${address}</div>
                  <div>
                  <div class="nearbyRight"><button data-target="nearby-${
                    index
                  }" class="btn modal-trigger">What's Nearby?</button></div>
                  </div>
                </div>
                <div id="nearby-${index}" class="modal bottom-sheet">
                  <div class="modal-content nearby">
                  </div>
                </div>
                <div class="controls-container">
                  <div>
                    <a data-target="${index}" 
                      class="waves-effect waves-light btn modal-trigger blue smalleditbutton" href="#modal2">Edit</a>
                    <a data-target="${index}" 
                      class="waves-effect waves-light btn modal-trigger red deletebutton">Delete</a>
                  </div>
                </div>
              </div>
            </div>
          </li>
        `);
        // Add the travel time for each non-home address (from home to the address)
        if (index !== 0) {
          this.getTime(
            mapManager.addresses[0].lat,
            mapManager.addresses[0].long,
            object.lat,
            object.long,
            index
          );
        }
      });

      // the "href" attribute of the modal trigger must specify the modal ID that wants to be triggered
      $('.modal').modal();
    }

    //Button click function to call nearby.js to grab restaurants and populate modal.
    mapManager.addresses.forEach((object, index) => {
      $(`button[data-target="nearby-${index}"]`).click(() => {
        this.nearby(object);
      });
    });
  }
  deleteAddress(index) {
    mapManager.addresses.splice(index, 1);
    database
      .ref(`users/${userManager.user.uid}`)
      .update({ addresses: mapManager.addresses });
    mapManager
      .clearPins()
      .setPins()
      .displayPins(mapManager.map)
      .moveToLocation(mapManager.addresses[0]);
  }
  getTime(firstLat, firstLong, secondLat, secondLong, index) {
    let getDirections = new google.maps.DirectionsService();
    let requestObject = {
      origin: firstLat + ',' + firstLong,
      destination: secondLat + ',' + secondLong,
      travelMode: 'DRIVING'
    };
    getDirections.route(requestObject, function(response) {
      $('#travel' + index).html(`
        <div class='chip'>
        <i class="tiny material-icons nomargin">airport_shuttle</i>
          ${response.routes[0].legs[0].duration.text}
        </div>
      `);
    });
  }
  nearby(address) {
    var latitude = address.lat;
    var longitude = address.long;
    var nearbyURL =
      'https://developers.zomato.com/api/v2.1/geocode?lat=' +
      latitude +
      '&lon=' +
      longitude;

    $.ajax({
      url: nearbyURL,
      method: 'GET',
      headers: {
        'user-key': '3db1ea2472489650b0b491a357916958'
      }
    }).done(function(response) {
      //Clear any information in the modal
      $('.nearby').html('');

      for (let i = 0; i < 5; i++) {
        // Pushing information into the nearby modal
        $('.nearby').append(`
          <div id="nearbycss">
            <h4>${response.nearby_restaurants[i].restaurant.name}</h4>
            <img class="nearbypic" src="${
              response.nearby_restaurants[i].restaurant.thumb
            }"/>
            <p class='nearbytext'>Address: ${
              response.nearby_restaurants[i].restaurant.location.address
            }</p>
            <p class='nearbytext'>Cuisine: ${
              response.nearby_restaurants[i].restaurant.cuisines
            }</p>
            <p class='nearbytext'>Price Range: ${'$'.repeat(
              response.nearby_restaurants[i].restaurant.price_range
            )}</p>
            <p class='nearbytext'>User Rating: ${
              response.nearby_restaurants[i].restaurant.user_rating
                .aggregate_rating
            }</p></div>`);
      }
    });
  }
}

const addressManager = new AddressManager();
