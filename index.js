var express = require("express");
var app = express();
var cooks;
var handles = require("express-handlebars");
var fs = require("fs");
var feedMeArrays = {};
var twitterToken;
var https = require("https");
var twitterKey = require("./projects/ticker/main.json");
var AccToken;
var arrayFromTwitter = [];


function getToken(key) {
    return Buffer(key.consumerKey + ":" + key.consumerSecret).toString("base64");
}

var readyToSend = getToken(twitterKey);



app.engine("handlebars", handles());
app.set("view engine", "handlebars");

app.use(require("cookie-parser")());
// console.log(require("cookie-parser")());


var arrayOfContent = fs.readdirSync("./projects");

feeder(arrayOfContent);

var breakingNews = {};

function feeder(array) {
    var arrayToGo = [];
    for (var i = 0; i < array.length; i++) {
        var oneObj = {
            img: array[i] + "/img.jpg" ,
            link: array[i] + "/description",
            name: array[i]
        };
        arrayToGo.push(oneObj);
    }
    feedMeArrays.array = arrayToGo;
}

// console.log(feedMeArrays);

var template = fs.readFileSync("./views/hello.handlebars");


app.use(function(req, res, next){

    if (req.url == "/name.html" || req.url == "/name") {
        return next();
    }
    if (req.cookies.firstName === undefined || req.cookies.lastName === undefined) {
        return next();
    }
    next();
});

app.use(express.static(__dirname + "/projects"));
app.use(express.static(__dirname + "/static"));



app.use(require("body-parser").urlencoded({
    extended: false
}));

app.get("/name", function (req, res) {
    res.sendFile(__dirname + "/statics/name.html");
});

app.get("/:project/description", function (req, res) {
    console.log(arrayOfContent);
    console.log(req.params.project);
    if (arrayOfContent.indexOf(req.params.project) != -1) {
        res.render(req.params.project + "/index", {
            array:[{
                firstName: req.cookies.firstName,
                headerLinks: "/http:" + arrayOfContent,
                headerTags: arrayOfContent
            }]});
    //the link that goes to the index.html of the project page )
} else {
    console.log("I have nothing to say to you");
}
});

app.get("/tweets", function(req, res, next) {
    aLittleStep(function callBack(error, data) {
        console.log("callback happened");
        if (error) {
            res.status(500).send("Ehm dude, the forrest's on fire...");
        }
        res.send(data);
    });
});

var options = {
    hostname: 'api.twitter.com',
    port: 443,
    path: '/oauth2/token',
    method: 'POST',
    "headers": {
        Authorization: "Basic " + readyToSend,
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
    }
};

function aLittleStep(callBack) {
    var req = https.request(options, function (res) {
        var frank = "";
        res.on("data", function(data) {
            frank += data;
        });
        res.on("end", function() {
            // console.log(frank);
            twitterToken = JSON.parse(frank);
            AccToken = "Bearer " + twitterToken.access_token;
            getMeTweets(twitterToken, callBack);
        });

    });
    req.write("grant_type=client_credentials");
    req.end();
}

function getMeTweets(token, callBack) {

    var tweetOptions = {
        hostname: "api.twitter.com",
        port: 443,
        path: "/1.1/statuses/user_timeline.json?screen_name=theonion",
        method: "GET",
        "headers": {
            Authorization: AccToken
        }
    };
    var req = https.request(tweetOptions, function(res) {
        res.on("error", function(error) {
            callBack(error);
        });
        req.on("error", function(error) {
            callBack(error);
        });
        var frank = "";
        res.on("data", function(data) {
            frank += data;
        });
        res.on("end", function() {
            var arrayForHandlebars = [];
            breakingNews = JSON.parse(frank);
            for (var j = 0; j < breakingNews.length; j++) {
                var breakingPoint = breakingNews[j].text.split("https");
                var oneNewObject = {
                    url: "https" + breakingPoint[1],
                    name: breakingPoint[0]
                };
                arrayForHandlebars.push(oneNewObject);
            }
            callBack(null, arrayForHandlebars);
        });
    });
    req.end();
}

app.post ("/name", function(req, res, next) {
    res.cookie("firstName", req.body.firstName);
    res.cookie("lastName", req.body.lastName);
    feedMeArrays.firstName = req.body.firstName;
    console.log(feedMeArrays);
    res.render("hello", feedMeArrays);
});

app.get("/hello", function (req, res) {
    res.render("hello", feedMeArrays);
});


app.listen(9002);

console.log("zog em to gog!");
