var APIKey = '166a433c57516f51dfab1f7edaed8413';

// Here we are building the URL we need to query the database
var queryURL =
  'https://api.openweathermap.org/data/2.5/weather?' +
  'q=austin&units=imperial&appid=' +
  APIKey;

// Here we run our AJAX call to the OpenWeatherMap API
$.ajax({
  url: queryURL,
  method: 'GET'
}).done(function(response) {
  // Transfer content to HTML
  $('#weather').html(
    `${response.name} ${Math.round(response.main.temp)} &deg; F, ${
      response.weather[0].description
    }`
  );
  $('#weather').css('textTransform', 'capitalize');
});
