// Zomato API 
var queryURL = "https://developers.zomato.com/api/v2.1/geocode?lat=30.266748&lon=-97.74176"

$.ajax({
	url: queryURL,
	method: 'GET',
	"headers": {
    "user-key": "3db1ea2472489650b0b491a357916958"}
}).done(function(response) {
	console.log(response);
});