class TravelTime {

// Make a call to Google Directions API for the travel time between two addresses,
// writes the time next to the address's label on the right hand side

    getTime(firstLat, firstLong, secondLat, secondLong, index) {
        let getDirections = new google.maps.DirectionsService();
        let requestObject = {
            origin: firstLat + "," + firstLong,
            destination: secondLat + "," + secondLong,
            travelMode: "DRIVING"
        };
        getDirections.route(requestObject, function(response){
            $("#travel" + index).html(`
                <div class='chip'>
                <i class="tiny material-icons nomargin">airport_shuttle</i>
                    ${response.routes[0].legs[0].duration.text}
                </div>
                `);
        });
    };

};

const travelTime = new TravelTime();