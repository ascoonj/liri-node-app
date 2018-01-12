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

//console.log("Spotify: ", spotify)
//console.log("Twitter: ", client);

var userSelection = process.argv[2];
//var userValue = process.argv[3];


inquirer.prompt([{
    type: "list",
    name: "activity",
    message: "Liri is ready when you are",
    choices: ["my-tweets", "spotify-this-song", "movie-this", "do-what-it-says"]
}]).then(function (inqResponse) {

    var activity = inqResponse.activity;

    //switch (userSelection) {

    switch (activity) {
        case "my-tweets":
            getTweets();
            break;

        case "spotify-this-song":
            getSongInfo();
            break;

        case "movie-this":
            getMovieInfo();
            break;

        case "do-what-it-says":
            doWhatItSays();
            break;
    };
});

function getTweets() {

    var params = {
        screen_name: "ayannajerome01",
        count: 5
    };

    client.get('statuses/user_timeline', params, function (err, data) {
        console.log(data);
        for (var i = 0; i < data.length; i++) {
            console.log("============================================================\n");
            console.log("Tweet #" + (i + 1) + ": " + data[i].text);
            // console.log("\n");
        };
        console.log("============================================================");
    });

};

function getSongInfo() {

    var songName = "";

    if (process.argv.length === 3) {
        songName = "The Sign by Ace of Base";
    } else {

        for (var i = 3; i < process.argv.length; i++) {
            if (i > 3) {
                songName = songName + " " + process.argv[i];
            } else {
                songName += process.argv[i];
            }
        };
    }

    spotify.search({
        type: 'track',
        query: songName,
        limit: 5
    }, function (err, data) {
        if (err) {
            return console.log('Error occurred: ' + err);
        }

        var songResults = data.tracks.items;

        //console.log("==================" + songName + "==================");
        for (let i = 0; i < songResults.length; i++) {
            // const element = songResults[i];
            console.log("========================================================================================================================= \n");
            // console.log("Artists:")
            var songArtists = [];
            for (let j = 0; j < songResults[i].artists.length; j++) {
                songArtists.push(songResults[i].artists[j].name);
                var listOfArtists = songArtists.join(", ");
            };

            console.log("Song Name: ", songResults[i].name);
            console.log("Artists: ", listOfArtists);
            console.log("Preview URL: ", songResults[i].preview_url);
            console.log("Album Name: ", songResults[i].album.name);

        };
        // console.log(data.tracks.items[0].artists[0].name);
        // console.log(data.tracks.items[0].name);
        // console.log(data.tracks.items[0].preview_url);
        // console.log(data.tracks.items[0].album.name);


        //console.log(JSON.stringify(data, null, 2));
        //console.log(data[0].name);
        console.log("=========================================================================================================================");
    });


};



function getMovieInfo() {

    var movieName = "";

    if (process.argv.length === 3) {
        movieName = "Mr.+Nobody";
    } else {

        for (var i = 3; i < process.argv.length; i++) {
            if (i > 3) {
                movieName = movieName + "+" + process.argv[i];
            } else {
                movieName += process.argv[i];
            }
        };
    }

    // Then run a request to the OMDB API with the movie specified
    var queryUrl = "http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&apikey=trilogy";

    console.log(queryUrl);

    // Then create a request to the queryUrl
    request(queryUrl, function (error, response, body) {

        // If the request is successful (i.e. if the response status code is 200)
        if (!error && response.statusCode === 200) {

            // Parse the body of the site and recover just the imdbRating
            // (Note: The syntax below for parsing isn't obvious. Just spend a few moments dissecting it).
            console.log("* Movie Title: " + JSON.parse(body).Title);
            console.log("* Release Year: " + JSON.parse(body).Year);
            console.log("* IMDB Rating: " + JSON.parse(body).Ratings[0].Value);
            console.log("* Rotten Tomatoes Rating: " + JSON.parse(body).Ratings[1].Value);
            console.log("* Country of Production: " + JSON.parse(body).Country);
            console.log("* Language: " + JSON.parse(body).Language);
            console.log("* Plot: " + JSON.parse(body).Plot);
            console.log("* Actors: " + JSON.parse(body).Actors);
        }
    });

};