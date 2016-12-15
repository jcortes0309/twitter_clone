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

  service.myTimeline = function() {
    console.log("I'm inside the myTimeline factory");
    return $http ({
      method: "GET",
      url: "/my_timeline",
    });
  };

  return service;
});


app.controller("ProfileController", function($scope, twitterFactory) {
  console.log("I got into the controller.  Yay!!!");
  twitterFactory.profile()
    .then(function(info) {
      console.log("Profile info received in the ProfileController", info);
      $scope.profile = info.data.profile_page.user;
      $scope.tweets = info.data.profile_page.tweets;
    })
    .catch(function(error) {
      console.log("There was an error!!!", error.stack);
    });
});

app.controller("MyTimelineController", function($scope, twitterFactory) {
  console.log("we're in the timeline controller");
  twitterFactory.myTimeline()
  .then(function(info) {
    console.log("mytimeline info", info);
    console.log("mytimeline tweets", info.data.info.following.name);
    console.log("mytimeline avatar", info.data.info.avatar_url);

    $scope.timeline_info = info.data.timelineInfo;
    $scope.user = info.data.timelineInfo.user;
    $scope.tweets = info.data.timelineInfo.tweets;


    console.log($scope.timeline_info);

  }).then (function(data) {
    console.log('success in timeline', data);
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
    templateUrl: "my_timeline.html",
    controller: "MyTimelineController"
  })
  .state({
    name: "profile",
    url: "/profile",
    templateUrl: "profile.html",
    controller: "ProfileController"
  });

  $urlRouterProvider.otherwise("/");
});
