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
      url: "/my_timeline"
    });
  };

  service.world = function() {
    console.log("inside world factory service");
    return $http ({
      method: "GET",
      url: "/world"
    });
  };

  service.signup = function(data) {
    console.log("in signup service", data);
    return $http ({
      method: 'POST',
      url: "/signup",
      data: data
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
    $scope.tweets = info.data.my_timeline_info.my_timeline_tweets;
    $scope.following = info.data.my_timeline_info.following_users;
  })
  .catch(function(error) {
    console.log("There was an error!!!", error.stack);
  });
});

app.controller("WorldController", function($scope, twitterFactory) {
  console.log("we're in the world controller");
  twitterFactory.world()
  .then(function(info) {
    console.log("world info", info);
    $scope.allTweets = info.data.world_timeline_info.world_tweets;
  })
  .catch(function(error) {
    console.log("There was an error!!!", error.stack);
  });
});

app.controller("SignupController", function($scope, twitterFactory) {
  console.log("in signup");

  $scope.signup = function() {
    console.log('in signupfunction');
    $scope.signup_data = {
      name: $scope.name,
      username: $scope.username,
      password: $scope.password
    };
    console.log("$scope.signup_data is ", $scope.signup_data);
    twitterFactory.signup($scope.signup_data);
  };
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
  })
  .state({
    name: "world",
    url: "/world",
    templateUrl: "world.html",
    controller: "WorldController"
  })
  .state({
    name: "signup",
    url: "/signup",
    templateUrl: "signup.html",
    controller: "SignupController"
  });

  $urlRouterProvider.otherwise("/");
});
