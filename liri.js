require("dotenv").config();

var fs = require("fs");
var request = require("request");
var Twitter = require("twitter");
var Spotify = require('node-spotify-api');
var keys = require("./keys.js");
var inquirer = require("inquirer");

//console.log("Keys: ", keys);

var spotify = new Spotify(keys.spotify);
var client = new Twitter(keys.twitter);

var userScreenName = "";
var userSong = "";
var userMovie = "";

//console.log("Spotify: ", spotify)
//console.log("Twitter: ", client);

startLiri();

function startLiri() {
    console.log("Welcome to the Liri Command Line Search App. You can look for movies, tweets and songs! ");

    inquirer.prompt([{
        type: "confirm",
        name: "start",
        message: "Would you like to try it out?",
        default: false

    }]).then(function (inqResponse) {

        if (inqResponse.start === true) {
            displayMenu();
        } else {
            console.log("============================================================");
            console.log("Okay, maybe next time!");
        }
    });
}

function displayMenu() {
    console.log("============================================================");
    inquirer.prompt([{
        type: "list",
        name: "activity",
        message: "Liri is ready when you are",
        choices: ["my-tweets", "spotify-this-song", "movie-this", "do-what-it-says"]
    }]).then(function (inqResponse) {

        console.log("============================================================");
        var activity = inqResponse.activity;
        evaluateSelection(activity);
    });
};

function searchMore() {
    inquirer.prompt([{
        type: "confirm",
        name: "searchAgain",
        message: "Wanna look up more stuff?",
        default: false

    }]).then(function (inqResponse) {

        if (inqResponse.searchAgain === true) {
            displayMenu();
        } else {
            console.log("============================================================");
            console.log("Thanks for trying Liri! Come back soon.");
        }
    });
}

function evaluateSelection(action) {

    logThis(action);
    switch (action) {
        case "my-tweets":
            getTwitHandle();
            break;

        case "spotify-this-song":
            getSong();
            break;

        case "movie-this":
            getMovie();
            break;

        case "do-what-it-says":
            doWhatItSays();
            break;
    };

}


function evaluateFile(action, option) {

    // fs.appendFileSync("./log.txt",action);
    switch (action) {
        case "my-tweets":
            getTweets(option);
            break;

        case "spotify-this-song":
            getSongInfo(option);
            break;

        case "movie-this":
            getMovieInfo(option);
            break;
    };

}

function getTwitHandle() {

    inquirer.prompt([{
        type: "input",
        name: "userScreenName",
        message: "Enter your twitter handle: ",
        default: "ayannajerome01"
    }]).then(function (inqResponse) {

        userScreenName = inqResponse.userScreenName;
        getTweets(userScreenName);
    });

}

function getTweets(twitHandle) {

    var params = {
        screen_name: twitHandle,
        count: 5
    };

    client.get('statuses/user_timeline', params, function (err, data) {
        //console.log(data);
        console.log(data.length);
        if (data.length === 0 || typeof data.length === "undefined") {
            logThis("No tweets here. Make sure you've spelled the screen-name correctly.")
            displayMenu();
        } else {
            data.forEach(function (element, i) {
                logThis("============================================================\n");
                logThis("Tweet #" + (i + 1) + ": " + element.text);
                logThis("Created On: " + element.created_at);
            });
            logThis("============================================================");
            searchMore();
        }


        // for (var i = 0; i < data.length; i++) {
        //     console.log("============================================================\n");
        //     console.log("Tweet #" + (i + 1) + ": " + data[i].text);
        //     // console.log("\n");
        // };
        // console.log("============================================================");
        // searchMore();
    });
};



function getSong() {

    inquirer.prompt([{
        type: "input",
        name: "userSong",
        message: "Enter a song to look up: ",
        default: "The Sign by Ace of Base"
    }]).then(function (inqResponse) {

        userSong = inqResponse.userSong;
        console.log("This is the song I want to search for: ", userSong);
        getSongInfo(userSong);
    });

};

function getSongInfo(song) {

    console.log("Is this my song: ", song);

    spotify.search({
        type: 'track',
        query: song,
        limit: 5
    }, function (err, data) {
        if (err) {
            return console.log('Error occurred: ' + err);
        } else {
            var songResults = data.tracks.items;
            logThis("You searched for: " + song);
            //console.log("==================" + songName + "==================");
            for (let i = 0; i < songResults.length; i++) {
                // const element = songResults[i];
                logThis("========================================================================================================================= \n");
                // console.log("Artists:")
                var songArtists = [];
                for (let j = 0; j < songResults[i].artists.length; j++) {
                    songArtists.push(songResults[i].artists[j].name);
                    var listOfArtists = songArtists.join(", ");
                };

                logThis("Song Name: " + songResults[i].name);
                logThis("Artists: " + listOfArtists);
                logThis("Preview URL: " + songResults[i].preview_url);
                logThis("Album Name: " + songResults[i].album.name);

            };
            // console.log(data.tracks.items[0].artists[0].name);
            // console.log(data.tracks.items[0].name);
            // console.log(data.tracks.items[0].preview_url);
            // console.log(data.tracks.items[0].album.name);


            //console.log(JSON.stringify(data, null, 2));
            //console.log(data[0].name);
            logThis("=========================================================================================================================");
            searchMore();
        }

    });


};


function getMovie() {

    inquirer.prompt([{
        type: "input",
        name: "userMovie",
        message: "Enter a movie to search for: ",
        default: "Mr. Nobody"
    }]).then(function (inqResponse) {

        userMovie = inqResponse.userMovie;

        getMovieInfo(userMovie);

    });
};

function getMovieInfo(movie) {

    // Then run a request to the OMDB API with the movie specified
    var queryUrl = "http://www.omdbapi.com/?t=" + movie + "&y=&plot=short&apikey=trilogy";

    //console.log(queryUrl);

    // Then create a request to the queryUrl
    request(queryUrl, function (error, response, body) {
        var {
            Title,
            Year
        } = JSON.parse(body);
        // If the request is successful (i.e. if the response status code is 200)
        if (!error && response.statusCode === 200) {

            // Parse the body of the site and recover just the imdbRating
            // (Note: The syntax below for parsing isn't obvious. Just spend a few moments dissecting it).
            if (typeof JSON.parse(body).Year === "undefined") {
                logThis("No movies by that name. Looks like you might have misspelled it :-(");
                displayMenu();
            } else {
                logThis("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
                logThis("* Movie Title: " + Title);
                logThis("* Release Year: " + JSON.parse(body).Year);
                logThis("* IMDB Rating: " + JSON.parse(body).Ratings[0].Value);
                logThis("* Rotten Tomatoes Rating: " + JSON.parse(body).Ratings[1].Value);
                logThis("* Country of Production: " + JSON.parse(body).Country);
                logThis("* Language: " + JSON.parse(body).Language);
                logThis("* Plot: " + JSON.parse(body).Plot);
                logThis("* Actors: " + JSON.parse(body).Actors);
                logThis("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++\n");

                searchMore();
            }
        }
    });
}


function doWhatItSays() {

    fs.readFile("random.txt", "utf8", function (error, data) {

        if (error) {
            return console.log(error);
        }

        // We will then print the contents of data
        //console.log(data);

        // Then split it by commas (to make it more readable)
        var dataArr = data.split(",");

        // We will then re-display the content as an array for later use.
        // console.log(dataArr);

        var fileAction = dataArr[0];
        var searchTerm = dataArr[1];

        logThis(fileAction + ": " + searchTerm);
        // console.log(searchTerm);

        evaluateFile(fileAction, searchTerm);

    });


}

function logThis(message) {
    console.log(message);
    fs.appendFileSync("./log.txt", message + "\n", "utf8");
}