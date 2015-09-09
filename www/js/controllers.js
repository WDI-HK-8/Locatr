angular.module('starter.controllers', [])

.controller('TabCtrl', function($scope, $location, $window){
  $scope.logout = function(){
    $window.localStorage.removeItem('current-user');

    $window.location.reload(true);
    $location.path('/login');
  }
})

.controller('InvitationsCtrl', function($scope, $http, $window) {
  $scope.currentUser = JSON.parse($window.localStorage.getItem('current-user'));

  $http.get('http://localhost:3000/users/'+$scope.currentUser.id+'/received').success(function(response){
    $scope.invitationsReceived = response;
  }).error(function(response){
    console.log(response);
  })

  $http.get('http://localhost:3000/users/'+$scope.currentUser.id+'/sent').success(function(response){
    $scope.invitationsSent = response;
  }).error(function(response){
    console.log(response);
  })

  $scope.acceptInvite = function(index){
    var data = {
      accepted: true
    }

    $scope.invitationToAccept = $scope.invitationsReceived[index];

    $http.put('http://localhost:3000/invitation/'+$scope.invitationToAccept.id, data).success(function(response){
      var groupUserData = {
          group_id: $scope.invitationToAccept.group_id,
          user_id: $scope.invitationToAccept.user_id
      }
      $http.post('http://localhost:3000/groups/'+$scope.invitationToAccept.group_id+'/group_users', groupUserData).success(function(response){
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

    $http.put('http://localhost:3000/invitation/'+$scope.invitationToReject.id, data).success(function(response){
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

  $http.get('http://localhost:3000/users/'+$scope.currentUser.id+'/group_users').success(function(response){
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

.controller('GroupCtrl', function($scope, $stateParams, $http, $location) {

  $http.get('http://localhost:3000/groups/'+$stateParams.id).success(function(response){
    $scope.group = response;
  }).error(function(response){
    console.log(response);
  });

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
        },
      }; 
       
      $scope.marker.options = {
        draggable: false,
        labelContent: "You",
        labelClass: "marker-labels"
      };  
    });
  }
 
  navigator.geolocation.getCurrentPosition($scope.drawMap);

  $scope.goInvite = function(){
    $location.path('/tab/group/'+$stateParams.id+'/new_invitation');
  }  
})

.controller('NewInvitationCtrl', function($scope, $stateParams, $http, $location, $window, $ionicPopup) {
  $scope.invitation = {}

  $scope.currentUser = JSON.parse($window.localStorage.getItem('current-user'));

  $http.get('http://localhost:3000/groups/'+$stateParams.id).success(function(response){
    $scope.group = response;
  }).error(function(response){
    console.log(response);
  });

  $scope.sendInvitation = function(){
    var data = {
      text: $scope.invitation.text
    }
    $http.post('http://localhost:3000/users/'+$scope.currentUser.id+'/groups/'+$stateParams.id+'/invitation/'+$scope.invitation.phoneNumber, data).success(function(response){
      console.log(response);
      $location.path('/tab/group/'+$stateParams.id);
    }).error(function(response){
      $ionicPopup.alert({
        title: 'Oops! Try again!'      
      });
    });
  }


})


.controller('SettingsCtrl', function($scope) {
  $scope.settings = {
    allowInvitations: true,
    goSilent: false
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

    $http.post('http://localhost:3000/groups', data).success(function(response){
      console.log(response);
      var userData = {
        user_id: $scope.currentUser.id
      }
      $http.post('http://localhost:3000/groups/'+response.id+'/group_users', userData).success(function(resp){
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
