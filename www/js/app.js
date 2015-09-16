// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'nemLogging', 'ng-cordova' ,'uiGmapgoogle-maps','ngResource', 'ng-token-auth', 'ngCordova'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider, $authProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
    .state('tab', {
    url: '/tab',
    abstract: true,
    cached: false,
    templateUrl: 'templates/tabs.html',
    controller: 'TabCtrl'
  })

  // Each tab has its own nav history stack:

  .state('tab.invitations', {
    cached: false,
    url: '/invitations',
    views: {
      'tab-invitations': {
        templateUrl: 'templates/tab-invitations.html',
        controller: 'InvitationsCtrl'
      }
    }
  })

  .state('tab.groups', {
      cached: false,
      url: '/groups',
      views: {
        'tab-groups': {
          templateUrl: 'templates/tab-groups.html',
          controller: 'GroupsCtrl'
        }
      }
    })

  .state('tab.addgroup', {
      url: '/addgroup',
      views: {
        'tab-groups': {
          templateUrl: 'templates/tab-addgroup.html',
          controller: 'AddGroupCtrl'
        }
      }
    })

  .state('tab.settings', {
    url: '/settings',
    views: {
      'tab-settings': {
        templateUrl: 'templates/tab-settings.html',
        controller: 'SettingsCtrl'
      }
    }
  })

  .state('tab.group', {
    url: '/group/:id',
    cached: false,
    views: {
        'tab-groups': {
          templateUrl: 'templates/group.html',
          controller: 'GroupCtrl'
        }
      }
    })

  .state('tab.new_invitation', {
    url: '/group/:id/new_invitation',
    views: {
        'tab-groups': {
          templateUrl: 'templates/new_invitation.html',
          controller: 'NewInvitationCtrl'
        }
      }
    })

  .state('login', {
    cached: false,
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'LoginCtrl'
  })

  .state('signup',{
    cached: false,
    url: '/signup',
    templateUrl: 'templates/signup.html',
    controller: 'SignupCtrl'
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');

  $authProvider.configure({
    // apiUrl: 'https://movie-finder-api.herokuapp.com'
    apiUrl: 'https://locatrbackend.herokuapp.com' // backend url
    // apiUrl: 'http://myapp.heroku.com' // heroku backend
  })

});
