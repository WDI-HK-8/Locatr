var apiUrl = 'https://locatrbackend.herokuapp.com'

angular.module('starter.controllers', [])

.controller('TabCtrl', function($scope, $location, $window, $interval, $cordovaGeolocation, $http, $timeout, $rootScope){
  $scope.data = {};
  $scope.currentUser = JSON.parse($window.localStorage.getItem('current-user'));
  $http.get(apiUrl+'/users/'+$scope.currentUser.id+'/received').success(function(response){
    $scope.data = response;
  }).error(function(response){
    console.log(response);
  })

  console.log($scope.currentUser);
  $scope.logout = function(){
    $window.localStorage.removeItem('current-user');
    $location.path('/login');
    cordova.plugins.backgroundMode.disable();
  }

  document.addEventListener('deviceready', function () {
    if(window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      window.cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }

    cordova.plugins.backgroundMode.enable();
    var updatePosition = function(){
      $interval(function(){
        var posOptions = { timeout: 5000, enableHighAccuracy: true, maximumAge: 5000 };
        $cordovaGeolocation.getCurrentPosition(posOptions)
          .then(function (location) {
          $rootScope.currentLat = location.coords.latitude;
          $rootScope.currentLong = location.coords.longitude;

          var data = {
            user: {
              'latitude': $rootScope.currentLat,
              'longitude': $rootScope.currentLong
            }
          };

          $http.put(apiUrl+'/coordinates/'+$scope.currentUser.id, data).success(function(response){
            console.log(response);
          }).error(function(response){
            console.log(response);
          })
        });
      }, 5000)
    }

    updatePosition();

    cordova.plugins.backgroundMode.onactivate = function(){
      updatePosition();
    }


  });
})

.controller('InvitationsCtrl', function($scope, $http, $window, $location) {
  var getReceived = function(){
    $http.get(apiUrl+'/users/'+$scope.currentUser.id+'/received').success(function(response){
      $scope.invitationsReceived = response;
    }).error(function(response){
      console.log(response);
    })
  }

  getReceived();

  $http.get(apiUrl+'/users/'+$scope.currentUser.id+'/sent').success(function(response){
    $scope.invitationsSent = response;
  }).error(function(response){
    console.log(response);
  })

  $scope.acceptInvite = function(index){
    var data = {
      accepted: true
    }

    $scope.invitationToAccept = $scope.invitationsReceived[index];

    $http.put(apiUrl+'/invitation/'+$scope.invitationToAccept.id, data).success(function(response){
      var groupUserData = {
          group_id: $scope.invitationToAccept.group_id,
          user_id: $scope.invitationToAccept.user_id
      }
      $http.post(apiUrl+'/groups/'+$scope.invitationToAccept.group_id+'/group_users', groupUserData).success(function(response){
        console.log(response);
        getReceived();
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

    $http.put(apiUrl+'/invitation/'+$scope.invitationToReject.id, data).success(function(response){
      $window.location.reload(true);
      console.log(response);
    }).error(function(response){
      console.log(response);
    })
  }

})

.controller('GroupsCtrl', function($scope, $location, $http, $window) {

  if ($scope.currentUser.silent === false){
    $http.get(apiUrl+'/users/'+$scope.currentUser.id+'/group_users').success(function(response){
      $scope.groups = response;
    }).error(function(response){
      console.log(response);
    });
  };

  $scope.goAdd = function(){
    $location.path('/tab/addgroup');
  }
})

.controller('LoginCtrl', function($scope, $ionicModal, $timeout, $auth, $ionicPopup, $window, $location) {
  $scope.currentUser = JSON.parse($window.localStorage.getItem('current-user'));

  if ($scope.currentUser!=null){
    $location.path('/tab/groups');
  };
  $scope.loginData = {};
  $scope.signupData = {};

  $scope.login = function() {
    $auth.submitLogin($scope.loginData).then(function(response){
      console.log(response);
      $window.localStorage.setItem('current-user',JSON.stringify(response));
      $scope.currentUser = JSON.parse($window.localStorage.getItem('current-user'));
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
      $ionicPopup.alert({
        title: 'Congrats! Signup complete'      
      });
      $window.localStorage.setItem('current-user',JSON.stringify(response.data.data));
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

.controller('GroupCtrl', function($scope, $stateParams, $http, $location, nemSimpleLogger, uiGmapGoogleMapApi, $window, $cordovaGeolocation, $timeout, $rootScope) {
  $http.get(apiUrl+'/groups/'+$stateParams.id).success(function(response){
    $scope.group = response;
  }).error(function(response){
    console.log(response);
  });

  nemSimpleLogger.doLog = true; //default is true
  nemSimpleLogger.currentLevel = nemSimpleLogger.LEVELS.debug

  var posOptions = { timeout: 5000, enableHighAccuracy: true, maximumAge: 5000 };
  $cordovaGeolocation.getCurrentPosition(posOptions)
    .then(function (location) {
    $rootScope.currentLat = location.coords.latitude;
    $rootScope.currentLong = location.coords.longitude;
  })

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

      $http.get(apiUrl+'/group/'+$stateParams.id+'/other_users/'+$scope.currentUser.id).success(function(response){
        $scope.userMarkers = response;
      })
    });
  }

  navigator.geolocation.getCurrentPosition($scope.drawSelfMap); 

  $scope.goInvite = function(){
    $location.path('/tab/group/'+$stateParams.id+'/new_invitation');
  }

  $scope.leaveGroup = function(){
    $http.delete(apiUrl+'/groups/'+$stateParams.id+'/to_delete/'+$scope.currentUser.id).success(function(response){
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

  $http.get(apiUrl+'/groups/'+$stateParams.id).success(function(response){
    $scope.group = response;
  }).error(function(response){
    console.log(response);
  });

  $scope.sendInvitation = function(){
    var data = {
      text: $scope.invitation.text
    }
    $http.post(apiUrl+'/users/'+$scope.currentUser.id+'/groups/'+$stateParams.id+'/invitation/'+$scope.invitation.phoneNumber, data).success(function(response){
      $location.path('/tab/group/'+$stateParams.id);
    }).error(function(response){
      $ionicPopup.alert({
        title: 'Oops! Try again!'      
      });
    });
  }


})


.controller('SettingsCtrl', function($scope, $window, $http) {
  $scope.settings = {
    allowInvitations: $scope.currentUser.accept_invites,
    goSilent: $scope.currentUser.silent
  };

  $scope.$watch('settings.allowInvitations',function(value) {
    data = {
      user: {
        accept_invites: value
      }
    }
    $http.put(apiUrl+'/settings/'+$scope.currentUser.id, data).success(function(response){
      $scope.currentUser.accept_invites = value;
      $window.localStorage.setItem('current-user',JSON.stringify($scope.currentUser));
    }).error(function(response){
      console.log(response);
    })
  })

  $scope.$watch('settings.goSilent',function(value) {
    data = {
      user: {
        silent: value
      }
    }
    $http.put(apiUrl+'/settings/'+$scope.currentUser.id, data).success(function(response){
      $scope.currentUser.silent = value;
      $window.localStorage.setItem('current-user',JSON.stringify($scope.currentUser));
    }).error(function(response){
      console.log(response);
    })
  })
})

.controller('AddGroupCtrl', function($scope, $cordovaFileTransfer, $location, $http, $window, $ionicPopup){
  $scope.groupData = {}
  $scope.image = {}
  
  $scope.addGroup = function(){
    // var data = {
    //   name: $scope.groupData.name
    // } 

    // $http.post(apiUrl+'/groups', data).success(function(response){
    //   console.log(response);
    //   var userData = {
    //     user_id: $scope.currentUser.id
    //   }
    //   $http.post(apiUrl+'/groups/'+response.id+'/group_users', userData).success(function(resp){
    //     console.log(resp);
    //     $window.location.reload(true);
    //     $location.path('/tab/groups');
    //   }).error(function(resp){
    //     console.log(resp);
    //   })
    // }).error(function(response){
    //   console.log(response);
    // })

    var options = {
      fileKey: "image",
      fileName: "image.png",
      chunkedMode: false,
      mimeType: "image/png",
      params: { name: $scope.groupData.name}
    };

    $cordovaFileTransfer.upload(apiUrl+'/groups', $scope.image.file, options)
      .then(function(result){
        $ionicPopup.alert({
        title: 'Congrats! A new group '+$scope.groupData.name+' has been added.'      
        });
        $http.post(apiUrl+'/groups/'+response.id+'/group_users', userData).success(function(resp){
          console.log(resp);
          $window.location.reload(true);
          $location.path('/tab/groups');
        }).error(function(resp){
          $ionicPopup.alert({
          title: 'Oops! There was an error adding you to the group!'      
          });
        })
      }, function(response){
        $ionicPopup.alert({
        title: 'Oops! There was an error inputting the group!'      
        });
      }, function(progress){});
  };

    
});
