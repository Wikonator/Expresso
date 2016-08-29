var options = {};
var accToken;
var twitterToken;
var https = require("https");
var breakingNews;

 function getToken(key) {
    return options = {
        hostname: 'api.twitter.com',
        port: 443,
        path: '/oauth2/token',
        method: 'POST',
        "headers": {
            Authorization: "Basic " + Buffer(key.consumerKey + ":" + key.consumerSecret).toString("base64"),
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
        }
    };
}

 function twitterPromise() {
    return new Promise(function (resolve, reject) {
        resolve(require("./main.json"));
    });
}

function promiseForTwitterToken(options) {

    return new Promise(function(resolve, reject) {
        var request = https.request(options, function (res) {

            var frankenstein = "";
            res.on("data", function(data) {
                frankenstein += data;
            });
            res.on("end", function() {
                twitterToken = JSON.parse(frankenstein);
                accToken = "Bearer " + twitterToken.access_token;
                resolve (twitterToken);

            });
        });
        request.write("grant_type=client_credentials");
        request.end();
        request.on("error", function(err) {
            reject (err);
            console.log(err);
        });
    });
}

function getMeTweets(token) {

    var arrayForHandlebars = [];
    var tweetOptions = {
        hostname: "api.twitter.com",
        port: 443,
        path: "/1.1/statuses/user_timeline.json?screen_name=theonion",
        method: "GET",
        "headers": {
            Authorization: accToken
        }
    };
    return new Promise(function (resolve, reject) {
        var req = https.request(tweetOptions, function(res) {
            res.on("error", function(error) {
                reject (error);
            });
            req.on("error", function(error) {
                reject (error);
            });
            var frank = "";
            res.on("data", function(data) {
                frank += data;
            });
            res.on("end", function() {
                breakingNews = JSON.parse(frank);
                for (var j = 0; j < breakingNews.length; j++) {
                    var breakingPoint = breakingNews[j].text.split("https");
                    var oneNewObject = {
                        url: "https" + breakingPoint[1],
                        name: breakingPoint[0]
                    };
                    arrayForHandlebars.push(oneNewObject);
                }
                // console.log(arrayForHandlebars, frank);
                resolve (arrayForHandlebars);
            });
        });
        req.end();
    });
}




module.exports = {
    getTweets : function getTweets(req, res) {
        return twitterPromise().then(getToken).then(promiseForTwitterToken).then(getMeTweets);
    }
};
