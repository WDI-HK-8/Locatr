angular.module('starter.controllers', [])

.controller('TabCtrl', function($scope, $location, $window, $cordovaBackgroundGeolocation, $cordovaGeolocation, $ionicPlatform, $timeout, $rootScope){
  $scope.logout = function(){
    $window.localStorage.removeItem('current-user');

    $window.location.reload(true);
    $location.path('/login');
  }

  $scope.loaded = false;

  $rootScope.deviceReady = false; 

  document.addEventListener('deviceready', function () {
    if(window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      window.cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }

    var bgGeo = $cordovaBackgroundGeolocation;
    console.log(bgGeo);
    var deviceId = $cordovaDevice.getUUID();
    console.log(deviceID);
    var addVisitUrl = 'your-url-goes-here';

    $rootScope.deviceId = deviceId;
    $rootScope.deviceReady = true;

    var posOptions = { timeout: 5000, enableHighAccuracy: true, maximumAge: 5000 };
    $cordovaGeolocation.getCurrentPosition(posOptions)
      .then(function (location) {
      $rootScope.currentLat = location.coords.latitude;
      $rootScope.currentLong = location.coords.longitude;

      var yourAjaxCallback = function(response) {
        bgGeo.finish();
      };

      var callbackFn = function(location) {
        var data = {
          deviceId: deviceId,
          "location": {
              "latitude": location.latitude,
              "longitude": location.longitude
          }
        };
        $http.post(addVisitUrl, data);
        // Other code goes here

        yourAjaxCallback.call(this);
      };

      var failureFn = function(error) {
        alert('Background Geolocation Error: ' + error);
        // Other code goes here
      };

      bgGeo.configure({
        url: addVisitUrl,
        params: {
          deviceId: deviceId,
          "location": {
            "latitude": $rootScope.currentLat,
            "longitude": $rootScope.currentLong
          }
        },
        desiredAccuracy: 10,
        stationaryRadius: 10,
        distanceFilter: 10,
        activityType: 'OtherNavigation',
        debug: true, 
        stopOnTerminate: false
      })
      .then(callbackFn, failureFn, callbackFn);

      bgGeo.start();
      console.log(bgGeo);
    });
  $rootScope.$digest();
  });
})

.controller('InvitationsCtrl', function($scope, $http, $window) {
  $scope.currentUser = JSON.parse($window.localStorage.getItem('current-user'));

  $http.get('https://locatrbackend.herokuapp.com/users/'+$scope.currentUser.id+'/received').success(function(response){
    $scope.invitationsReceived = response;
  }).error(function(response){
    console.log(response);
  })

  $http.get('https://locatrbackend.herokuapp.com/users/'+$scope.currentUser.id+'/sent').success(function(response){
    $scope.invitationsSent = response;
  }).error(function(response){
    console.log(response);
  })

  $scope.acceptInvite = function(index){
    var data = {
      accepted: true
    }

    $scope.invitationToAccept = $scope.invitationsReceived[index];

    $http.put('https://locatrbackend.herokuapp.com/invitation/'+$scope.invitationToAccept.id, data).success(function(response){
      var groupUserData = {
          group_id: $scope.invitationToAccept.group_id,
          user_id: $scope.invitationToAccept.user_id
      }
      $http.post('https://locatrbackend.herokuapp.com/groups/'+$scope.invitationToAccept.group_id+'/group_users', groupUserData).success(function(response){
        console.log(response);
        $window.location.reload(true);
      }).error(function(response){
        console.log(response);
      })
      console.log(response);
    }).error(function(response){
      console.log(response);
    })
  }

  $scope.rejectInvite = function(index){
    var data = {
      rejected: true
    }

    $scope.invitationToReject = $scope.invitationsReceived[index];

    $http.put('https://locatrbackend.herokuapp.com/invitation/'+$scope.invitationToReject.id, data).success(function(response){
      $window.location.reload(true);
      console.log(response);
    }).error(function(response){
      console.log(response);
    })
  }

})

.controller('GroupsCtrl', function($scope, $location, $http, $window) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.currentUser = JSON.parse($window.localStorage.getItem('current-user'));

  $http.get('https://locatrbackend.herokuapp.com/users/'+$scope.currentUser.id+'/group_users').success(function(response){
    $scope.groups = response;
  }).error(function(response){
    console.log(response);
  });

  $scope.goAdd = function(){
    $location.path('/tab/addgroup');
  }
})

.controller('LoginCtrl', function($scope, $ionicModal, $timeout, $auth, $ionicPopup, $window, $location) {
  var validateUser = function(){
    $scope.currentUser = JSON.parse($window.localStorage.getItem('current-user'));
    console.log($scope.currentUser);
  };

  validateUser();

  if ($scope.currentUser!=null){
    $location.path('/tab/groups');
  };
  $scope.loginData = {};
  $scope.signupData = {};

  $scope.login = function() {
    $auth.submitLogin($scope.loginData).then(function(response){
      console.log(response);

      $window.localStorage.setItem('current-user',JSON.stringify(response));

      validateUser();

      $window.location.reload(true);
      $location.path('/tab/groups');
    }).catch(function(response){
      console.log(response);
      $ionicPopup.alert({
        title: 'Oops! Try again!',
        template: response.errors[0]
      });
    });
  };

  $scope.doSignup = function() {
    $auth.submitRegistration($scope.signupData).then(function(response){
      console.log(response);

      $window.localStorage.setItem('current-user',JSON.stringify(response.data.data));

      validateUser();

      $window.location.reload(true);
      $location.path('/tab/groups');
    }).catch(function(response){
      console.log(response);
      $ionicPopup.alert({
        title: 'Invalid signup information!',
        template: response.data.errors.full_messages[0]
      });
    });
  };
})

.controller('GroupCtrl', function($scope, $stateParams, $http, $location, nemSimpleLogger, uiGmapGoogleMapApi, $window, $cordovaBackgroundGeolocation) {

  $scope.currentUser = JSON.parse($window.localStorage.getItem('current-user'));

  $http.get('https://locatrbackend.herokuapp.com/groups/'+$stateParams.id).success(function(response){
    $scope.group = response;
  }).error(function(response){
    console.log(response);
  });

  // $scope.myLocation = {
  //   lng : '',
  //   lat: ''
  // }
   
  // $scope.drawMap = function(position) {
 
  //   //$scope.$apply is needed to trigger the digest cycle when the geolocation arrives and to update all the watchers
  //   $scope.$apply(function() {
  //     $scope.myLocation.lng = position.coords.longitude;
  //     $scope.myLocation.lat = position.coords.latitude;
 
  //     $scope.map = {
  //       center: {
  //         latitude: $scope.myLocation.lat,
  //         longitude: $scope.myLocation.lng
  //       },
  //       zoom: 14,
  //       pan: 1
  //     };
 
  //     $scope.marker = {
  //       id: 0,
  //       coords: {
  //         latitude: $scope.myLocation.lat,
  //         longitude: $scope.myLocation.lng
  //       },
  //     }; 
       
  //     $scope.marker.options = {
  //       draggable: false,
  //       labelContent: "You",
  //       labelClass: "marker-labels"
  //     };  
  //   });
  // }
 
  // navigator.geolocation.getCurrentPosition($scope.drawMap);

   nemSimpleLogger.doLog = true; //default is true
   nemSimpleLogger.currentLevel = nemSimpleLogger.LEVELS.debug

   $scope.myLocation = {
     lng : '',
     lat: ''
   }

   $scope.drawSelfMap = function(position) { 
     //$scope.$apply is needed to trigger the digest cycle when the geolocation arrives and to update all the watchers
     $scope.$apply(function() {
       $scope.myLocation.lng = position.coords.longitude;
       $scope.myLocation.lat = position.coords.latitude;

       $scope.map = {
         center: {
           latitude: $scope.myLocation.lat,
           longitude: $scope.myLocation.lng
         },
         zoom: 14,
         pan: 2
       };

       $scope.marker = {
         id: "you",
         coords: {
           latitude: $scope.myLocation.lat,
           longitude: $scope.myLocation.lng
         },
         options: {
             animation: google.maps.Animation.BOUNCE,
             icon: 'http://labs.google.com/ridefinder/images/mm_20_black.png'            
         }
       };

       $scope.pickUpMarkers =[
         {
           id: "a",
           title: "abc",
           latitude: $scope.myLocation.lat+0.002,
           longitude: $scope.myLocation.lng+0.002,
           location: "fasfdasf",
           car_make: "safdsfda",
           name: "asdfsd",
           icon: 'http://labs.google.com/ridefinder/images/mm_20_blue.png',
           show: false,
           clickPin: function(){  
           }
         },
         {
           id: "b",
           title: "bde", 
           latitude: $scope.myLocation.lat+0.001,
           longitude: $scope.myLocation.lng+0.001,
           location: "fasfdasf",
           car_make: "safdsfda",
           name: "asdfsd",
           icon: 'http://labs.google.com/ridefinder/images/mm_20_blue.png',
           show: false,
           clickPin: function(){
           }
         }
       ]

       $scope.dropOffMarkers =[
         {
           id: "a",
           title: "abc",
           latitude: $scope.myLocation.lat+0.0002,
           longitude: $scope.myLocation.lng+0.0002,
           location: "fasfdasf",
           car_make: "safdsfda",
           name: "asdfsd",
           icon: 'http://labs.google.com/ridefinder/images/mm_20_red.png',
           show: false,
           clickPin: function(){  
           }
         },
         {
           id: "b",
           title: "bde", 
           latitude: $scope.myLocation.lat+0.0001,
           longitude: $scope.myLocation.lng+0.0001,
           location: "fasfdasf",
           car_make: "safdsfda",
           name: "asdfsd",
           icon: 'http://labs.google.com/ridefinder/images/mm_20_red.png',
           show: false,
           clickPin: function(){
           }
         }
       ]
     });
   }


 navigator.geolocation.getCurrentPosition($scope.drawSelfMap); 

  $scope.goInvite = function(){
    $location.path('/tab/group/'+$stateParams.id+'/new_invitation');
  }

  $scope.leaveGroup = function(){
    $http.delete('https://locatrbackend.herokuapp.com/groups/'+$stateParams.id+'/to_delete/'+$scope.currentUser.id).success(function(response){
      console.log(response);
      $location.path('/tab/groups');
    }).error(function(response){
      console.log(response);
    })
  }  
})

.controller('NewInvitationCtrl', function($scope, $stateParams, $http, $location, $window, $ionicPopup) {
  $scope.invitation = {}

  $scope.currentUser = JSON.parse($window.localStorage.getItem('current-user'));

  $http.get('https://locatrbackend.herokuapp.com/groups/'+$stateParams.id).success(function(response){
    $scope.group = response;
  }).error(function(response){
    console.log(response);
  });

  $scope.sendInvitation = function(){
    var data = {
      text: $scope.invitation.text
    }
    $http.post('https://locatrbackend.herokuapp.com/users/'+$scope.currentUser.id+'/groups/'+$stateParams.id+'/invitation/'+$scope.invitation.phoneNumber, data).success(function(response){
      console.log(response);
      $location.path('/tab/group/'+$stateParams.id);
    }).error(function(response){
      $ionicPopup.alert({
        title: 'Oops! Try again!'      
      });
    });
  }


})


.controller('SettingsCtrl', function($scope, $window) {
  $scope.currentUser = JSON.parse($window.localStorage.getItem('current-user'));

  console.log($scope.currentUser)



  $scope.settings = {
    allowInvitations: $scope.currentUser.accept_invites,
    goSilent: $scope.currentUser.silent
  };
})

.controller('AddGroupCtrl', function($scope, $cordovaFileTransfer, $location, $http, $window){
  $scope.groupData = {}
  // $scope.upload = function() {
  //   var options = {
  //     fileKey: "avatar",
  //     fileName: "image.png",
  //     chunkedMode: false,
  //     mimeType: "image/png"
  //   };
  // };

  $scope.addGroup = function(){
    $scope.currentUser = JSON.parse($window.localStorage.getItem('current-user'));
    console.log($scope.currentUser);
    var data = {
      name: $scope.groupData.name
    } 

    $http.post('https://locatrbackend.herokuapp.com/groups', data).success(function(response){
      console.log(response);
      var userData = {
        user_id: $scope.currentUser.id
      }
      $http.post('https://locatrbackend.herokuapp.com/groups/'+response.id+'/group_users', userData).success(function(resp){
        console.log(resp);
        $window.location.reload(true);
        $location.path('/tab/groups');
      }).error(function(resp){
        console.log(resp);
      })
    }).error(function(response){
      console.log(response);
    })
  }
});
