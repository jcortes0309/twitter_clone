// Will be the front end (somehow)

var app = angular.module("twitter_clone", ["ui.router"]);

app.factory("twitterFactory", function($http, $rootScope) {
  var service = {};

  service.profile = function() {
    return $http ({
      method: "GET",
      url: "/profile"
    });
  };

  return service;
});


app.controller("ProfileController", function($scope, twitterFactory) {
  console.log("I got into the controller.  Yay!!!");
  twitterFactory.profile()
    .then(function(info) {
      console.log("Profile info received in the ProfileController", info);
      $scope.info = info;
    })
    .catch(function(error) {
      console.log("There was an error!!!", error.stack);
    });

});


app.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
  .state({
    name: "home",
    url: "/",
    templateUrl: "my_timeline.html"
  })
  .state({
    name: "profile",
    url: "/profile",
    templateUrl: "profile.html",
    controller: "ProfileController"
  });

  $urlRouterProvider.otherwise("/");
});
