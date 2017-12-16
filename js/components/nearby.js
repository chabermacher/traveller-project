// Zomato API
function nearby(address) {
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
    for (i = 0; i < 5; i++) {
      // Pushing Information into the search details
      //$(".collapsible-body").html("<li><span><img class='responsive-img' src=" + response.nearby_restaurants[i].restaurant.thumb + "/>" +
      //"Address: " + response.nearby_restaurants[i].restaurant.location.address +
      //"User Rating: " + response.nearby_restaurants[i].restaurant.user_rating.aggregate_rating +
      //"</span></li>");

      console.log(response.nearby_restaurants[i].restaurant);
      console.log(response.nearby_restaurants[i].restaurant.name);

      // Console Log Address Output
      console.log(response.nearby_restaurants[i].restaurant.location.address);
      console.log(response.nearby_restaurants[i].restaurant.location.latitude);
      console.log(response.nearby_restaurants[i].restaurant.location.longitude);

      // Console Log Restaurant Information
      console.log(response.nearby_restaurants[i].restaurant.cuisines);
      console.log(response.nearby_restaurants[i].restaurant.price_range);
      console.log(
        response.nearby_restaurants[i].restaurant.user_rating.aggregate_rating
      );
      console.log(response.nearby_restaurants[i].restaurant.thumb);
    }
  });
}
