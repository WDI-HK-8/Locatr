var bgGeo;

angular.module('starter.services', [])

.factory('locationService', function($http, $location, $window){
    function startBackgroundLocation() {
        var gpsOptions = {
            enableHighAccuracy : true,
            timeout: 10000,
            maximumAge: 5000
        };
        navigator.geolocation.getCurrentPosition(function(location) {
            console.log('Location from Phonegap');
        },
        function (error){
            alert('error with GPS: error.code: ' + error.code + ' Message: ' + error.message);
        },gpsOptions);

        console.log(window.plugins)
        bgGeo = $window.plugins.backgroundGeoLocation;

        /**
        * This would be your own callback for Ajax-requests after POSTing background geolocation to your server.
        */
        var yourAjaxCallback = function(response) {
            ////
            // IMPORTANT:  You must execute the #finish method here to inform the native plugin that you're finished,
            //  and the background-task may be completed.  You must do this regardless if your HTTP request is successful or not.
            // IF YOU DON'T, ios will CRASH YOUR APP for spending too much time in the background.
            //
            //
            bgGeo.finish();
        };

        /**
        * This callback will be executed every time a geolocation is recorded in the background.
        */
        var callbackFn = function(location) {
            alert('[js] BackgroundGeoLocation callback:  ' + location.latitudue + ',' + location.longitude);
            // Do your HTTP request here to POST location to your server.
            //
            //

            // This is never called in Android
            yourAjaxCallback.call(this);
        };

        var failureFn = function(error) {
            alert('BackgroundGeoLocation error');
        }

        // BackgroundGeoLocation is highly configurable.
        bgGeo.configure(callbackFn, failureFn, {
            url: apiUrl +'/position/', // <-- only required for Android; ios allows javascript callbacks for your http
            params: {                                               // HTTP POST params sent to your server when persisting locations.
               auth_token: localStorage.getItem('gcmToken')
            },
            desiredAccuracy: 10,
            stationaryRadius: 20,
            distanceFilter: 30,
            debug: true // <-- enable this hear sounds for background-geolocation life-cycle.
        });

        // Turn ON the background-geolocation system.  The user will be tracked whenever they suspend the app.
        // wenn der Service bereits läuft, nicht mehr starten
        bgGeo.start();
    }

    function stopBackgroundLocation(){
        bgGeo.stop();
    }

    return {
        start: function(){
            startBackgroundLocation();
        },
        stop : function () {
            stopBackgroundLocation();
        }
    }
})
