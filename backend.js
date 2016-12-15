const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bluebird = require("bluebird");
mongoose.Promise = bluebird;

mongoose.connect("mongodb://localhost/twitter_clone");

app.use(express.static("public"));

const User = mongoose.model('User', {
  _id: String, // actually the username
  name: String,
  avatar_url: String,
  following: [String],
  // followers: [ObjectId]  // do not need it for now
});

const Tweet = mongoose.model('Tweet', {
  text: String,
  date: Date,
  userID: String
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

  var userId = 'Hulkster';

  User.findOne({ _id: userId})
    .then(function(userInfo) {
      console.log('USER INFO::', userInfo);
      return [userInfo, Tweet.find({
        userID: {
          $in: userInfo.following.concat([userId])
        }
      })];
    })
    .then(function(tweets) {
      console.log("\n\nHere are the tweets\n\n", tweets);
      response.json({
        info: tweets[0]
      });

    })
    .catch(function(err) {
      console.log('encountered err retrieving user profile::', err.message);
    });
  // User.findById("Hulkster");
  // bluebird.all([
  //   Tweet.find({ userID: 'Hulkster' }).limit(20),
  //   User.findById('Hulkster')
  // ])
  // .spread(function(tweets, user) {
  //   var timelineInfo = {
  //     tweets: tweets,
  //     user: user
  //   };
  //   response.json({
  //     timelineInfo: timelineInfo
  //   });
  // })
  // .catch(function(error) {
  //   response.status(400);
  //   response.json({
  //     message: "It didn't work!",
  //   });
  //   console.log("We got an error! ", error.stack);
  // });


  // User.findById("Hulkster", function(error, user) {
  //     console.log("\nUser's info", user);
  //     Tweet.find({ userID: { $in: user.following.concat([user._id]) }}, function(error,tweets){
  //         console.log("Tweets",tweets);
  //         var followers = {};
  //         for(let i = 0; i < tweets.length; i++){
  //           followers[tweets[i]] = tweets[i];
  //         }
  //         console.log("Followers user info",followers)
  //     });
  // });




  // My timeline
  // User.findById("Hulkster")
  //   .then(function(user) {
  //     console.log("\nUser's info", user);
  //       Tweet.find({
  //         userID: {
  //           $in: user.following.concat([user._id])
  //         }
  //       });
  //   })
  //   .then(function(tweets) {
  //     // you have the tweets
  //     console.log("Here are the tweets: \n", tweets);
  //     response.json({
  //       all_tweets: tweets
  //     });
  //   });
  //






  // console.log("myTimeline controller backend", request);
  // response.json({
  //   message: "timeline backend message"
  // });
});


// bluebird.all([
//   Tweet.find({ userID: 'Hulkster' }).limit(20),
//   User.findById('Hulkster')
// ])
// .spread(function(tweets, user) {
//   console.log('tweets information: ',tweets);
//   console.log('\nuser information:', user);
//   var allmystuff = tweets + user;
// });
// .then(function(successstuff) {
//   console.log('\n\nsuccess stuff inside .then', successstuff);
//   })
// .catch(function(err) {
//   console.log('errrrrr no hulkster', err.message);
// });
//
//
// // My timeline
// User.findById(theUserId)
//   .then(function(user) {
//     return Tweet.find({
//       userID: {
//         $in: user.following.concat([user._id])
//       }
//     });
//   })
//   .then(function(tweets) {
//     // you have the tweets
//   });







app.listen(3000, function() {
  console.log("Hello MFs!");
});
