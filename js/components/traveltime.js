class TravelTime {

// Make a call to Google Directions API for the travel time between two addresses,
// writes the time next to the address's label on the right hand side

    getTime(firstLat, firstLong, secondLat, secondLong) {
        let getDirections = new google.maps.DirectionsService();
        let requestObject = {
            origin: firstLat + "," + firstLong,
            destination: secondLat + "," + secondLong,
            travelMode: "DRIVING"
        };
        getDirections.route(requestObject, function(response){
            console.log(response);
        });
    };

};

const travelTime = new TravelTime();