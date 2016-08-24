var express = require("express");
var app = express();
var cooks;
var handles = require("express-handlebars");
var fs = require("fs");
var feedMeArrays = {};
var twitterToken;
var https = require("https");
var twitterKey = require("./projects/ticker/main.json");

function getToken(key) {
    console.log(key.consumerKey + ":" + key.consumerSecret);
    return Buffer(key.consumerKey + ":" + key.consumerSecret).toString("base64");
}

var readyToSend = getToken(twitterKey);
console.log(readyToSend);


app.engine("handlebars", handles());
app.set("view engine", "handlebars");

app.use(require("cookie-parser")());
// console.log(require("cookie-parser")());


var arrayOfContent = fs.readdirSync("./projects");

feeder(arrayOfContent);

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
    res.render("hello", feedMeArrays);
});

// app.get("/:project/description", function (req, res) {
//     if (arrayOfContent.contains(req.params.project)) {
//         res.render(req.params.project + "/index", {
//             array:[{
//                 firstName: req1.cookies.firstName,
//                 headerLinks: ,
//                 headerTags: ,
//             }
//         ]
//     }//the link that goes to the index.html of the project page )
// )}
// });

app.get("/tweets", function(req, res, next) {
    //check if you have a twitter key if not get it if yes move on with your life
    if (!twitterToken) {
        aLittleStep();
        console.log("taking a Little Step");
    } else {
        getMeTweets(twitterToken);
    }
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

    function aLittleStep() {
        var req = https.request(options, function (res) {
            var frank = "";
            res.on("data", function(data) {
                frank += data;
            });
            res.on("end", function() {
                console.log(frank);
                twitterToken = frank;
            });

        });
        req.write("grant_type=client_credentials");
        req.end();
    }

// function getMeTweets(token) {
//     var req = https.request(options, res, function() {
//         var options = {
//             path: /1.1/statuses/user_timeline.json?screen_name=theonion
//         }
//     })
// }
//
    app.post ("/name", function(req, res, next) {
        res.cookie("firstName", req.body.firstName);
        res.cookie("lastName", req.body.lastName);
        feedMeSluts = {
            firstName: req.body.firstName
        };
        next();
    });


    app.listen(9002);

    console.log("zog em to gog!");
