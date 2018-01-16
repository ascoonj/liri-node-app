// Require all packages
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

//Establish global variables
var userScreenName = "";
var userSong = "";
var userMovie = "";

//Test that the keys are being imported from the keys correctly
//console.log("Spotify: ", spotify)
//console.log("Twitter: ", client);



//Function to introduce the app, and give the user the opportunity to try it or not. 
function startLiri() {
    console.log("Welcome to the Liri Command Line Search App. You can look for movies, tweets and songs! ");

    inquirer.prompt([{
        type: "confirm",
        name: "start",
        message: "Would you like to try it out?",
        default: false

    }]).then(function (inqResponse) {
        //After receiving the user response
        //display the menu if the user responds affirmatively.
        if (inqResponse.start === true) {
            displayMenu();
            //Otherwise, provide an exit message.
        } else {
            console.log("============================================================");
            console.log("Okay, maybe next time!");
        }
    });
}

startLiri();

// Function to display the main menu of search options to the user that will be presented
// repeatedly while the user continues to use the app
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
        //After the response is returned, call a function to check the answer and perform the
        //appropriate process
        evaluateSelection(activity);
    });
};

// Checks with the user after they have received a result from a search whether they want
// to search for something else.
// Prevents the app from exiting unnecessarily if the user wishes to perform multiple searches
function searchMore() {
    inquirer.prompt([{
        type: "confirm",
        name: "searchAgain",
        message: "Wanna look up more stuff?",
        default: false

    }]).then(function (inqResponse) {
        //After the response is returned, if the user responds affirmatively, re-display the main menu of options
        if (inqResponse.searchAgain === true) {
            displayMenu();
        } else {
            //Otherwise, display a friendly exit message.
            console.log("============================================================");
            console.log("Thanks for trying Liri! Come back soon.");
        }
    });
}

// Use a switch case statement to conditioanlly determine what to do based on the user selection
function evaluateSelection(action) {
    // Log the user's choice from the menu to the screen and to the log.txt file.
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

// If the user selects the "do-what-it-says" option, this function bypasses the steps to get specific search terms
// and directly runs that function listed in the random.txt file with the search term also contained therein.
function evaluateFile(action, option) {
    // Log the file's action and searchterm to the screen and to the log.txt file.
    logThis(action);
    logThis(option);
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

// Prompt the user to enter a twitter screen name for use in the Twitter API call
function getTwitHandle() {

    inquirer.prompt([{
        type: "input",
        name: "userScreenName",
        message: "Enter your twitter handle: ",
        default: "ayannajerome01"
    }]).then(function (inqResponse) {

        userScreenName = inqResponse.userScreenName;
        //Pass the user-provided screen-name to the function containing the API call
        getTweets(userScreenName);
    });

}

// Build the TWitter API call, allowing a twitter screen-name to be passed as an argument.
function getTweets(twitHandle) {
    // Store the API call paramaters in an object
    var params = {
        screen_name: twitHandle,
        count: 5
    };
    // Make the Twitter API call
    client.get('statuses/user_timeline', params, function (err, data) {
        //console.log(data);
        console.log(data.length);
        // After the response is retutrned, verify that it contains tweets
        // If it does not, log a message to the screen and to the log file
        // And re-display the menu to allow the user to search again
        if (data.length === 0 || typeof data.length === "undefined") {
            logThis("No tweets here. Make sure you've spelled the screen-name correctly.")
            displayMenu();
        } else {
            // Otherwsie, iterate over the tweets to display on screen the text of the tweets, 
            // and the time at which they were created
            // Also log the info to the log.txt file
            data.forEach(function (element, i) {
                logThis("============================================================\n");
                logThis("Tweet #" + (i + 1) + ": " + element.text);
                logThis("Created On: " + element.created_at);
            });
            logThis("============================================================");
            // Call the function offering user the option to search again
            searchMore();
        }
    });
};

// Prompt the user for a song to search for with the Spotify API
function getSong() {

    inquirer.prompt([{
        type: "input",
        name: "userSong",
        message: "Enter a song to look up: ",
        default: "The Sign by Ace of Base"
    }]).then(function (inqResponse) {

        userSong = inqResponse.userSong;
        // Log the user's search song to the screen and to the log.txt file
        logThis("User searched for: " + userSong);
        // Pass the user-provided song to the function containing the API call
        getSongInfo(userSong);
    });

};

// Build the Spotify API call within a function, allowing a song to be passed as an argument.
function getSongInfo(song) {

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
            //Iterate over the array containing the song details
            for (let i = 0; i < songResults.length; i++) {
                // const element = songResults[i];
                logThis("========================================================================================================================= \n");
                // console.log("Artists:")
                // Create an empty array to hold artists in the event of multiple artists
                var songArtists = [];
                //Iterated over the artists array
                for (let j = 0; j < songResults[i].artists.length; j++) {
                    //Add each artist to the artist array
                    songArtists.push(songResults[i].artists[j].name);
                    // Join the array to make the data more readable
                    var listOfArtists = songArtists.join(", ");
                };
                //Print to the screen, and log to the log.txt file the name, artists, preview URL 
                // and album name of each song
                logThis("Song Name: " + songResults[i].name);
                logThis("Artists: " + listOfArtists);
                logThis("Preview URL: " + songResults[i].preview_url);
                logThis("Album Name: " + songResults[i].album.name);

            };
            //Present the data in readable format to determine how to traverse it
            //console.log(JSON.stringify(data, null, 2));
            
            logThis("=========================================================================================================================");
            
            // Call the function offering user the option to search again
            searchMore();
        }
    });
};

// Prompt the user for a movie to search for with the OMDB API
function getMovie() {

    inquirer.prompt([{
        type: "input",
        name: "userMovie",
        message: "Enter a movie to search for: ",
        default: "Mr. Nobody"
    }]).then(function (inqResponse) {

        userMovie = inqResponse.userMovie;
        // Pass the user-provided movie to the function containing the http request
        getMovieInfo(userMovie);

    });
};

function getMovieInfo(movie) {

    // Run a request to the OMDB API with the movie specified
    var queryUrl = "http://www.omdbapi.com/?t=" + movie + "&y=&plot=short&apikey=trilogy";

    //console.log(queryUrl);

    // Create a request to the queryUrl
    request(queryUrl, function (error, response, body) {
        var {
            Title,
            Year
        } = JSON.parse(body);
        // If the request is successful (i.e. if the response status code is 200)
        if (!error && response.statusCode === 200) {

            // Parse the body of the site and recover just the specified details
            // Check that valid movie info is returned
            if (typeof JSON.parse(body).Year === "undefined") {
                // if undefined, display message to user, and re-dislay main menu
                logThis("No movies by that name. Looks like you might have misspelled it :-(");
                displayMenu();
                // Otherwise traverse the response and display the details, and log them to the log.txt file
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
                // Then give the user the option to continue using the app or exit
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

        // Test the contents of the data
        //console.log(data);

        // Then split it by commas (to make it more readable)
        var dataArr = data.split(",");

        // Once split, the data is now an array with two members
        // Store each in a variable, to be passed to the function for evaluation
        var fileAction = dataArr[0];
        var searchTerm = dataArr[1];

        // Diplay the values to the screen and log to the log.txt file
        logThis(fileAction + ": " + searchTerm);
        
        // Pass the values to the function
        evaluateFile(fileAction, searchTerm);

    });
}

// Create a function to facilitate logging data to the screen and to the log file in one step
function logThis(message) {
    console.log(message);
    fs.appendFileSync("./log.txt", message + "\n", "utf8");
}