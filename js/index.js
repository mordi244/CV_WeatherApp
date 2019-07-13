/* --------------- Weather Application -----------------*/


//declare variables
var map; //google map var
var geocoder; // geocode 
var markers = []; //markers array

//initial google map
function initMap() {
    // declare variables
    var coords; // obj of the coordinates (lat,lng)

    // setting the map with constant center.
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 40.295308, lng: 62.164714 },
        zoom: 4
    });

    //initial geocoder for search from text field
    geocoder = new google.maps.Geocoder();
    document.getElementById('submit').addEventListener('click', function () {
        geocodeAddress(geocoder, map);
    });

    // get lng and lat and call the weather api
    google.maps.event.addListener(map, 'click', function (event) {
        coords = { lat: event.latLng.lat(), lng: event.latLng.lng() };
        getWeather(coords);
    });

    //add marker to the map. inputs - coordinates of the location and the content of the weather
    function addMarker(coords, contentStr) {
        var marker = new google.maps.Marker({
            position: coords,
            map: map
        });
        //set the infowindow with the weather content
        var infoWindow = new google.maps.InfoWindow({
            content: contentStr
        });
        infoWindow.open(map, marker);
        marker.addListener('click', function () {
            infoWindow.open(map, marker);
        });
        deleteOverlays();//display marker in the map
        markers.push(marker); //push the marker to markers array
        showOverlays();//remove the marker from the map
    }

    //display marker in the map
    function showOverlays() {
        if (markers) {
            for (let i in markers) {
                markers[i].setMap(map);
            }
        }
    }

    //remove the marker from the map
    function deleteOverlays() {
        if (markers) {
            for (let i in markers) {
                markers[i].setMap(null);
            }
            markers.length = 0;
        }
    }

    //get weather function. inputs - location coordinates - async function
    const getWeather = async (coords) => {
        try {
            console.log("in the await funcuin");
            let response = await fetch('https://api.openweathermap.org/data/2.5/weather?lat=' + coords.lat + '&lon=' + coords.lng + '&units=metric&appid=c894fa26f98d61a6892f65d827493bef');
            let myJson = await response.json();
            console.log("mj json await functuin : ");
            console.log(myJson);
            countryName(coords, myJson);
        } catch (err) {
            console.log("Error: " + err);
        }
    }

    // function for text field input. 
    function geocodeAddress(geocoder, resultsMap) {
        var address = document.getElementById('address').value;
        geocoder.geocode({ 'address': address }, function (results, status) {
            if (status === 'OK') {
                resultsMap.setCenter(results[0].geometry.location);
                coords = { lat: results[0].geometry.bounds.na.j, lng: results[0].geometry.bounds.ga.j };
                getWeather(coords);
            } else {
                alert('Geocode was not successful for the following reason: ' + status);
            }
        });
    }

    //api to get the full name of the country accordint to the alpha code.
    function countryName(coords, weatherDetails) {
        var content = "";
        fetch('https://restcountries.eu/rest/v2/alpha/' + weatherDetails.sys.country)
            .then((response) => {
                return response.json();
            })
            .then((myJson) => {
                content += '<div class="content">' +
                    '<img src="http://openweathermap.org/img/w/' + weatherDetails.weather[0].icon + '.png">' +
                    '<h1 id="firstHeading" class="firstHeading">' + weatherDetails.name + ',' + myJson.name + '</h1>' +
                    '<div id="bodyContent">' +
                    '<div class="info"><span class="spnWeather">General: </span> ' + weatherDetails.weather[0].main + '</div>' +
                    '<div class="info"><span class="spnWeather">Description: </span> ' + weatherDetails.weather[0].description + '</div>' +
                    '<div class="info"><span class="spnWeather">Temperature: </span> ' + weatherDetails.main.temp + '&#8451</div>' +
                    '<div class="info"><span class="spnWeather">Humidity: </span> ' + weatherDetails.main.humidity + '</div>' +
                    '<div class="info"><span class="spnWeather">Wind Speed: </span> ' + weatherDetails.wind.speed + ' mph</div>' +
                    '</div>' +
                    '</div>';
                addMarker(coords, content); // add marker only when the content of the seather is valid
            }).catch((err) => { //in case of error
                console.log("Error: " + err);
            });
    }

} // end of init map function


initMap(); //initlal map
