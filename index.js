var express = require("express");
var app = express();
var cooks;
var handles = require("express-handlebars");
var fs = require("fs");
var feedMeArrays = {};
var getTwitt = require("./getTwitt.js");
var https = require("https");
var pg = require("pg");


// var twitterKey = require("./projects/ticker/main.json");

var arrayFromTwitter = [];

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

//import the function below from getTwitt

app.get("/tweets", function(req, res, next) {
    console.log("tweets are happening");
    getTwitt.getTweets().then(function(tweets) {
        res.json(tweets);
    }).catch(function(err) {
        console.log(err);
        res.sendStatus(500);
    });
});

app.get("/users", function (req, res, next) {
  console.log("users requested");
  var allMyUsers = [];
  var client = new pg.Client("postgres://spiced:spiced1@localhost:5432/Users");
  client.connect(function(err) {
    if (err) {
      console.log("couldnt connect to the tables yo");
      throw err;
    }

    var checkEm;
    client.query("SELECT * FROM usernames;", function(error, results) {
      if (error) {
        console.log("could not get usernames, fam");
        throw error;
      }
      checkEm = results;
      client.end();
      function createArrForHandlebars(results) {
        allMyUsers = results.rows;
        res.render("users", {
          myUsers: allMyUsers,
          cookieName : req.cookies.firstName
        });
        console.log(req.cookies.firstName);
      };

      createArrForHandlebars(checkEm);
      // console.log(checkEm);
    });
  });
});



function addUser(firstName, lastName) {
  var client = new pg.Client("postgres://spiced:spiced1@localhost:5432/Users");
  client.connect(function(err) {
    if (err) {
      console.log("no connection happened");
      throw err;
    }
    var input = 'INSERT INTO usernames (first_name, last_name) VALUES ($1, $2) RETURNING id';

    client.query(input, [firstName, lastName], function(error, results) {
      console.log(results.rows);
      client.end();
    });
  });
}

function modifyUser(age, city, homepage, color) {
    var client = new pg.Client("postgres://spiced:spiced1@localhost:5432/Users");
    client.connect(function(error) {
        if (error) {
            console.log("cant connect to database");
            throw error;
        }
        var putin = "INSERT INTO user_profiles (age, city, homepage, color) VALUES ($1, $2, $3, $4) RETURNING id";

        client.query(putin, [age, city, homepage, color], function(error, results) {
            console.log(results.rows);
            client.end();
        });
    });
}

// var redis = require("redis");
// var client = redis.createClient({
//     host: "localhost",
//     port: 6379
// });
//
// client.on('error', function(err) {
//     console.log(err);
// });
//
// client.setex("city", 60, "berlin", function(err, data) {
//     if (err) {
//         return console.log(err);
//     }
//     console.log('We captured the "city"');
//
//     client.get("city")
// })

app.post ("/name", function(req, res, next) {
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    res.cookie("firstName", firstName);
    res.cookie("lastName", lastName);
    feedMeArrays.firstName = firstName;
    addUser(firstName,lastName);
    console.log(firstName);
    res.render("moar");
});

app.post ("/moar", function (req, res, next) {
    var age = req.body.age,
    city = req.body.city,
    homepage = req.body.homepage,
    color = req.body.color;
    modifyUser(age,city,homepage,color)
    res.render("hello", feedMeArrays);
})

app.get("/hello", function (req, res) {
    res.render("hello", feedMeArrays);
});


app.listen(9002);

console.log("go away");
