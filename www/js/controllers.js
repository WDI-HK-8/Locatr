var apiUrl = 'https://locatrbackend.herokuapp.com';

angular.module('starter.controllers', [])

.controller('TabCtrl', function($scope, $location, $window, $interval, $cordovaGeolocation, $http, $timeout, $rootScope, $ionicLoading){
  $scope.show = function() {
    $ionicLoading.show({
      template: '<p>Loading...</p><ion-spinner></ion-spinner>'
    });
  };

  $scope.hide = function(){
    $ionicLoading.hide();
  };

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
          $scope.currentUser.latitude = location.coords.latitude;
          $scope.currentUser.longitude = location.coords.longitude;

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
      }, 30000)
    }

    updatePosition();

    cordova.plugins.backgroundMode.onactivate = function(){
      updatePosition();
    }


  });
})

.controller('InvitationsCtrl', function($scope, $http, $window, $location, $ionicLoading) {

  $scope.show($ionicLoading);

  var getReceived = function(){
    $http.get(apiUrl+'/users/'+$scope.currentUser.id+'/received').success(function(response){
      $scope.invitationsReceived = response;
      $scope.data = response;
      $scope.hide($ionicLoading);
    }).error(function(response){
      console.log(response);
      $scope.hide($ionicLoading);
    })
  }

  getReceived();

  $scope.acceptInvite = function(index){
    $scope.show($ionicLoading);
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
        $scope.hide($ionicLoading);
      })
      console.log(response);
    }).error(function(response){
      console.log(response);
      $scope.hide($ionicLoading);
    })
  }

  $scope.rejectInvite = function(index){
    $scope.show($ionicLoading);
    var data = {
      rejected: true
    }

    $scope.invitationToReject = $scope.invitationsReceived[index];

    $http.put(apiUrl+'/invitation/'+$scope.invitationToReject.id, data).success(function(response){
      $window.location.reload(true);
      console.log(response);
      $scope.hide($ionicLoading);
    }).error(function(response){
      console.log(response);
      $scope.hide($ionicLoading);
    })
  }

})

.controller('GroupsCtrl', function($scope, $location, $http, $window, $ionicLoading) {

  $scope.show($ionicLoading);

  if ($scope.currentUser.silent === false){
    $http.get(apiUrl+'/users/'+$scope.currentUser.id+'/group_users').success(function(response){
      $scope.groups = response;
      $scope.hide($ionicLoading);
    }).error(function(response){
      console.log(response);
      $scope.hide($ionicLoading);
    });
  } else {
    $scope.hide($ionicLoading);
  }
  ;


  $scope.goAdd = function(){
    $location.path('/tab/addgroup');
  }
})

.controller('LoginCtrl', function($scope, $timeout, $auth, $ionicPopup, $window, $location) {
  $scope.currentUser = JSON.parse($window.localStorage.getItem('current-user'));

  if ($scope.currentUser!=null){
    $location.path('/tab/groups');
  };
  $scope.loginData = {};

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
})

.controller('SignupCtrl',function($scope, $location, $http, $window, $auth, $ionicPopup){
  $scope.signupData = {};
  $scope.doSignup = function() {
    $auth.submitRegistration($scope.signupData).then(function(response){
      $window.localStorage.setItem('current-user',JSON.stringify(response.data.data));
      $window.location.reload(true);
      $location.path('/login');
    }).catch(function(response){
      console.log(response);
      $ionicPopup.alert({
        title: 'Invalid signup information!',
        template: response.data.errors.full_messages[0]
      });
    });
  };
})

.controller('GroupCtrl', function($scope, $stateParams, $http, $location, nemSimpleLogger, uiGmapGoogleMapApi, $window, $cordovaGeolocation, $timeout, $rootScope, $state, $interval, $ionicLoading, $ionicScrollDelegate) {
  $scope.currentUser = JSON.parse($window.localStorage.getItem('current-user'));
  if ($scope.currentUser.silent==true){
    $state.go('tab.groups');
  };

  $scope.show($ionicLoading);

  $http.get(apiUrl+'/groups/'+$stateParams.id).success(function(response){
    $scope.group = response;
  }).error(function(response){
    console.log(response);
  });

  nemSimpleLogger.doLog = true; //default is true
  nemSimpleLogger.currentLevel = nemSimpleLogger.LEVELS.debug

  $scope.drawSelfMap = function(position) { 
     //$scope.$apply is needed to trigger the digest cycle when the geolocation arrives and to update all the watchers
    $scope.$apply(function() {
      $http.get(apiUrl+'/group/'+$stateParams.id+'/other_users/'+$scope.currentUser.id).success(function(response){
        $scope.userMarkers = response;
        for (i = 0; i < $scope.userMarkers.length; i++){
          $scope.userMarkers[i].show = false;
        }
        console.log($scope.userMarkers);
        $scope.map = {
          center: {
            latitude: $scope.currentUser.latitude,
            longitude: $scope.currentUser.longitude
          },
          zoom: 20,
          pan: 2,
        };
      })
    });
    $scope.marker = {
      id: "you",
      coords: {
        latitude: $scope.currentUser.latitude,
        longitude: $scope.currentUser.longitude
      },
      phoneNumber: $scope.currentUser.phoneNumber,
      email: $scope.currentUser.email,
      show: true,
      options: {
       animation: google.maps.Animation.BOUNCE,
       icon: 'http://labs.google.com/ridefinder/images/mm_20_green.png',
       zIndex: 0
      },
    };

    $http.get(apiUrl+'/users/'+$scope.currentUser.id+'/groups/'+$stateParams.id+'/sent').success(function(response){
      $scope.sent = response;
    })
    $scope.hide($ionicLoading);
  }

  var updateUsers = function(){
    $interval(function(){
      $http.get(apiUrl+'/group/'+$stateParams.id+'/other_users/'+$scope.currentUser.id).success(function(response){
        $scope.userMarkers = response;
        for (var i=0; i < $scope.userMarkers.length; i++) {
          if ($scope.userMarkers[i].id === clicked) {
            $scope.userMarkers[i].show = true;
          }
        }
        console.log($scope.userMarkers);
      });
    }, 60000)

    $scope.marker = {
      id: "you",
      coords: {
        latitude: $scope.currentUser.latitude,
        longitude: $scope.currentUser.longitude
      },
      phoneNumber: $scope.currentUser.phoneNumber,
      email: $scope.currentUser.email,
      show: true,
      options: {
       animation: google.maps.Animation.BOUNCE,
       icon: 'http://labs.google.com/ridefinder/images/mm_20_green.png',
       zIndex: 0
      },
    };
  };

  var clicked = 0;

  updateUsers();

  navigator.geolocation.getCurrentPosition($scope.drawSelfMap);

  $scope.myClick = function(id){
    clicked = id;
    for (var i=0; i < $scope.userMarkers.length; i++) {
        if ($scope.userMarkers[i].id === id) {
            obj =  $scope.userMarkers[i];
            obj.show = true;
        } else {
          $scope.userMarkers[i].show = false;
        }
    }
    $scope.map.center = {
      latitude: obj.latitude,
      longitude: obj.longitude
    };
    $scope.map.zoom = 20;
    $ionicScrollDelegate.scrollTop(true);
  } 

  $scope.goInvite = function(){
    $location.path('/tab/group/'+$stateParams.id+'/new_invitation');
  }

  $scope.leaveGroup = function(){
    $scope.show($ionicLoading);
    $http.delete(apiUrl+'/groups/'+$stateParams.id+'/to_delete/'+$scope.currentUser.id).success(function(response){
      console.log(response);
      $scope.hide($ionicLoading);
      $location.path('/tab/groups');
    }).error(function(response){
      console.log(response);
      $scope.hide($ionicLoading);
    })
  }  
})

.controller('NewInvitationCtrl', function($scope, $stateParams, $http, $location, $window, $ionicPopup, $ionicLoading) {
  $scope.invitation = {}

  $scope.currentUser = JSON.parse($window.localStorage.getItem('current-user'));

  $http.get(apiUrl+'/groups/'+$stateParams.id).success(function(response){
    $scope.group = response;
  }).error(function(response){
    console.log(response);
  });

  $scope.sendInvitation = function(){
    $scope.show($ionicLoading);
    var data = {
      text: $scope.invitation.text
    }
    $http.post(apiUrl+'/users/'+$scope.currentUser.id+'/groups/'+$stateParams.id+'/invitation/'+$scope.invitation.phoneNumber, data).success(function(response){
      $ionicPopup.alert({
        title: 'Success! Invitation sent!'     
      });
      $scope.hide($ionicLoading);
      $location.path('/tab/group/'+$stateParams.id);
    }).error(function(response){
      $scope.hide($ionicLoading);
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

.controller('AddGroupCtrl', function($scope, $cordovaFileTransfer, $location, $http, $window, $ionicPopup, $ionicLoading){
  $scope.groupData = {}
  $scope.image = {}
  
  $scope.addGroup = function(){
    $scope.show($ionicLoading);
    var data = {
      name: $scope.groupData.name
    } 

    $http.post(apiUrl+'/groups', data).success(function(response){
      console.log(response);
      var userData = {
        user_id: $scope.currentUser.id
      }
      $http.post(apiUrl+'/groups/'+response.id+'/group_users', userData).success(function(resp){
        console.log(resp);
        $scope.hide($ionicLoading);
        $window.location.reload(true);
        $location.path('/tab/groups');
      }).error(function(resp){
        console.log(resp);
        $scope.hide($ionicLoading);
      })
    }).error(function(response){
      console.log(response);
      $scope.hide($ionicLoading);
    })

    // var options = {
    //   fileKey: "image",
    //   fileName: "image.png",
    //   chunkedMode: false,
    //   mimeType: "image/png",
    //   params: { name: $scope.groupData.name}
    // };

    // $cordovaFileTransfer.upload(apiUrl+'/groups', $scope.image.file, options)
    //   .then(function(result){
    //     $ionicPopup.alert({
    //     title: 'Congrats! A new group '+$scope.groupData.name+' has been added.'      
    //     });
    //     $http.post(apiUrl+'/groups/'+response.id+'/group_users', userData).success(function(resp){
    //       console.log(resp);
    //       $window.location.reload(true);
    //       $location.path('/tab/groups');
    //     }).error(function(resp){
    //       $ionicPopup.alert({
    //       title: 'Oops! There was an error adding you to the group!'      
    //       });
    //     })
    //   }, function(response){
    //     $ionicPopup.alert({
    //     title: 'Oops! There was an error inputting the group!'      
    //     });
    //   }, function(progress){});
  };  
});
