const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bluebird = require("bluebird");
const _ = require("lodash");
const bodyParser = require("body-parser");
const uuid = require("uuid");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const myPlaintextPassword = 's0/\/\P4$$w0rD';
const someOtherPlaintextPassword = 'not_bacon';

mongoose.Promise = bluebird;

mongoose.connect("mongodb://localhost/twitter_clone");
mongoose.set("debug", true);

app.use(express.static("public"));
app.use(bodyParser.json());

const User = mongoose.model('User', {
  _id: String, // actually the username
  name: String,
  password: String,
  avatar_url: String,
  following: [String]
  // followers: [ObjectId]  // do not need it for now
});

const Tweet = mongoose.model('Tweet', {
  text: String,
  date: Date,
  userID: String,
  name: String,
  avatar_url: String,
});

var firstTweet = new Tweet( {
  text: "this is the first ever tweet in history",
  date: new Date(),
  userID: "Tom"
});

// var secondTweet = new Tweet( {
//   text: "this is the second ever tweet in history",
//   date: new Date(),
//   userID: "IAmAnything"
// });
// var hulkTweet2 = new Tweet( {
//   text: "this is the hulksters second tweet",
//   date: new Date(),
//   userID: "Hulkster"
// });
// hulkTweet2.save()
//   .then(function(blah) {
//     console.log('hulk tweet success', blah);
//   })
//   .catch(function(err) {
//     console.log('hulkster fail', err.stack);
//   });

// secondTweet.save()
//   .then(function(blah) {
//     console.log('second tweet success', blah);
//   })
//   .catch(function(err) {
//     console.log('fail2', err.stack);
//   });
// var tomCruise = new User({
//   _id: "Tom",
//   name: "Tom Cruise"
// });
//
// var thirdUser = new User({
//   _id: "HulkHogan",
//   name: "Hulkster"
// });
// //
// thirdUser.save()
//   .then(function(result) {
//     console.log("Save success3", result);
//   })
//   .catch(function(error) {
//     console.log("Didn't save3 because: ", error.stack);
//     // console.log("Detailed information : ", error.errors);
//   });
//
// anything.save()
//   .then(function(result) {
//     console.log("Save success", result);
//   })
//   .catch(function(error) {
//     console.log("Didn't save because: ", error.stack);
//     console.log("Didn't save because: ", error.message);
//     // console.log("Detailed information : ", error.errors);
//   });
//
// console.log("Something happened again");
// console.log("print anything", anything);

// World Timeline
// Tweet.find().limit(20)
//   .then(function(stuff) {
//     console.log('did a find thing', stuff);
//   })
//   .catch(function(err) {
//     console.log('bigtime fail', err.stack);
//   });

//
// // User Profile page
app.get("/profile", function(request, response) {
  console.log("I'm in the backend");

  bluebird.all([
    Tweet.find({ userID: 'Hulkster' }).limit(20),
    User.findById('Hulkster')
  ])
  .spread(function(tweets, user) {
    var profile_page = {
      tweets: tweets,
      user: user
    };
    console.log('profile info is: ', profile_page);
    // console.log("This is the response: ", response);

    response.json({
      profile_page: profile_page
    });
    // console.log('tweets information: ',tweets);
    // console.log('\nuser information:', user);
  })
  .catch(function(error) {
    response.status(400);
    response.json({
      message: "It didn't work!",
    });
    console.log("We got an error! ", error.stack);
  });


});


app.get("/my_timeline", function(request, response) {
  // My timeline
  // Finds a specific user and returns a promise
  User.findById("Hulkster")
    .then(function(user) {
      // console.log("\nUser's info\n", user);
      // Looks at all the tweets and will return the tweets for everyone the user is following, including his/her tweets
      return Tweet.find({
        userID: {
          $in: user.following.concat([user._id])
        }
      });
    })
    // Receives all the tweets previously returned
    .then(function(tweets) {
      // console.log("User info: ", user);
      // Creates an array that will hold the userIDs of everyone the user is following (based on the information found in the tweets)
      var following = [];
      tweets.forEach(function(tweet) {
        // console.log("\n\nTweet inside tweets: \n", tweet);
        following.push(tweet.userID);
      });
      // Removes duplicate values from the following array
      following = _.uniqBy(following);
      console.log("\nI'm following: ", following);
      console.log("\n\n");
      // Gets the user information only for the users found in the following array
      return User.find({
        _id: {
          $in: following
        }
      })
      // Receives the information for all the users previously returned (only the ones the user is following)
      .then(function(following_users) {
        // Creates an indexed object
        var indexed_following_users = {};
        // Loops through every user that was previously returned (inside following_users) and creates a new object with the key value equal to the information found in user._id (the user's id inside mongodb)
        following_users.forEach(function(user) {
          indexed_following_users[user._id] = user;
          // console.log("\n\nindexed_following_users information: \n\n", indexed_following_users);
        });
        // Loops through every tweet
        tweets.forEach(function(tweet) {
          // console.log("\n\nHERE IS MY TWEET\n\n", tweet);
          // Creates a variable called user and assigns the user whose key value (from the indexed_following_users object) equals tweet.UserID
          let user = indexed_following_users[tweet.userID];
          // console.log(user);
          tweet.name = user.name;
          tweet.avatar_url = user.avatar_url;
        });
        var my_timeline_info = {
          following_users: following_users,
          my_timeline_tweets: tweets
        };
        // console.log("\n\nmy_timeline_info\n\n", my_timeline_info);
        response.json({
          my_timeline_info: my_timeline_info
        });
      })
      .catch(function(error) {
        response.status(400);
        response.json({
          message: "It didn't work!",
        });
        console.log("We got an error! ", error.stack);
      });
    });
});

app.get("/world", function(request, response) {
  console.log("I'm at the beginning of the /world backend");
  // My timeline
  Tweet.find()
    .then(function(tweets) {
      console.log("world", tweets);
      // console.log("User info: ", user);
      var allUsers = [];
      tweets.forEach(function(tweet) {
        // console.log("\n\nTweet inside tweets: \n", tweet);
        allUsers.push(tweet.userID);
      });
      console.log('allusers', allUsers);
      allUsers = _.uniqBy(allUsers);
      console.log("\nI'm allUsers: ", allUsers);
      console.log("\n\n");
        return User.find({
          _id: {
            $in: allUsers
          }
        })
        .then(function(users) {
          console.log('success users from allUsers that tweet', users);
          var indexed_users = {};
            users.forEach(function(user) {
              indexed_users[user._id] = user;
              console.log("\n\nindexed_users information: \n\n", indexed_users);
            });
            tweets.forEach(function(tweet) {
              console.log("\n\nHERE IS MY TWEET\n\n", tweet);
              let user = indexed_users[tweet.userID];
              // console.log(user);
              tweet.name = user.name;
              tweet.avatar_url = user.avatar_url;
            });
            var world_timeline_info = {
              world_tweets: tweets
            };
            console.log("\n\nworld_timeline_info\n\n", world_timeline_info);
            response.json({
              world_timeline_info: world_timeline_info
            });
        })
        .catch(function(error) {
          response.status(400);
          response.json({
            message: "It didn't work!",
          });
          console.log("We got an error world! ", error.stack);
        });
    });
});

app.post('/signup', function(request, response) {
  console.log("This is the request: ", request.body);
  var name = request.body['name'];
  var username = request.body['username'];
  var password = request.body['password'];

  bcrypt.hash(password, saltRounds)
    .then(function(hash) {
      console.log("This is the hash: ", hash);
      var newSignup = new User({
        name: name,
        _id: username,
        password: hash
      });

      console.log("This is the newSignup info: ", newSignup);

      newSignup.save()
        .then(function(result) {
          console.log("Save success", result);
        })
        .catch(function(error) {
          console.log("Didn't save because: ", error.stack);
          // console.log("Detailed information : ", error.errors);
        });
    })
    .catch(function(error) {
      console.log("Didn't save because: ", error.stack);
     });
});





app.listen(3000, function() {
  console.log("Hello MFs!");
});
