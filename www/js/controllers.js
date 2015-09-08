angular.module('starter.controllers', [])

.controller('InvitationsCtrl', function($scope) {})

.controller('GroupsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('LoginCtrl', function($scope, $ionicModal, $timeout, $auth, $ionicPopup, $window, $location) {
  var validateUser = function(){
    $scope.currentUser = JSON.parse($window.localStorage.getItem('current-user'));
    console.log($scope.currentUser);
  };

  validateUser();
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

  $scope.logout = function(){
    $window.localStorage.removeItem('current-user');
    validateUser();

    $window.location.reload(true);
  }
})

.controller('GroupCtrl', function($scope) {
  $scope.myLocation = {
    lng : '',
    lat: ''
  }
   
  $scope.drawMap = function(position) {
 
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
        pan: 1
      };
 
      $scope.marker = {
        id: 0,
        coords: {
          latitude: $scope.myLocation.lat,
          longitude: $scope.myLocation.lng
        }
      }; 
       
      $scope.marker.options = {
        draggable: false,
        labelContent: "lat: " + $scope.marker.coords.latitude + '<br/> ' + 'lon: ' + $scope.marker.coords.longitude,
        labelAnchor: "80 120",
        labelClass: "marker-labels"
      };  
    });
  }
 
  navigator.geolocation.getCurrentPosition($scope.drawMap); 
})


.controller('SettingsCtrl', function($scope) {
  $scope.settings = {
    allowInvitations: true,
    goSilent: false
  };
});
