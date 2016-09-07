var express = require("express"),
redis = require("redis"),
cache = redis.createClient({
    host: "localhost",
    port: 6379
}),
app = express(),
cooks,
handles = require("express-handlebars"),
fs = require("fs"),
feedMeArrays = {},
getTwitt = require("./getTwitt.js"),
https = require("https"),
pg = require("pg");


cache.on('error', function(err) {
    console.log(err);
});
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
    console.log(req.query);

    function createArrForHandlebars(results) {
        var allMyUsers = results.rows;
        // console.log("createArrForHandlebars ran" + allMyUsers);
        cityItems = allMyUsers.map(function(cv,ind,arr){
            return cv.city
        });
        colorItems = allMyUsers.map(function(cv,ind,arr){
            return cv.color
        });
        function makeUniqueItems(items) {
            var checkArray = [];
            items.forEach(function(item){
                if (checkArray.indexOf(item) == -1) {
                    checkArray.push(item);
                }
            });
            return checkArray;
        }

            cityItems = makeUniqueItems(cityItems),
            colorItems = makeUniqueItems(colorItems);
            console.log(colorItems);
            res.render("users", {
                city: cityItems,
                color: colorItems,
                myUsers: allMyUsers,
                cookieName : req.cookies.firstName
            });
    };

    cache.get("users", function(err, data){
        console.log(err);
        if (data !== null) {
            var results = JSON.parse(data);
            return createArrForHandlebars(results);
        }
    });


    var allMyUsers = [];
    var client = new pg.Client("postgres://spiced:spiced1@localhost:5432/Users");
    client.connect(function(err) {
        if (err) {
            console.log("couldnt connect to the tables yo");
            throw err;
        }
        var checkEm;
            if (req.query === "") {
                client.query("SELECT * FROM usernames JOIN user_profiles ON usernames_id = usernames.id;"
                , function(error, results) {
                    if (error) {
                        console.log("could not get usernames, fam");
                        throw error;
                    }
                    checkEm = results;
                    var cityItems = [],
                    colorItems = [];
                    // console.log(checkEm);
                    createArrForHandlebars(checkEm);
                    client.end();
                });
                // console.log(checkEm);
            } else {
                var city = req.query.city,
                color = req.query.color,
                input = "SELECT * FROM usernames JOIN user_profiles ON usernames_id = usernames.id WHERE city = '" +city+"' AND color = '" + color+"';"
                client.query(input, function(err, results) {
                    if (err) {
                        console.log("couldnt get specified search");
                        throw err;
                    }
                    checkEm = results;
                    createArrForHandlebars(checkEm);
                })
            }
    });
});

// app.post("/users", function(res, req) {
//
// });

function addUser(firstName, lastName, res) {
  var client = new pg.Client("postgres://spiced:spiced1@localhost:5432/Users");
  client.connect(function(err) {
    if (err) {
      console.log("no connection happened");
      throw err;
    }
    var input = 'INSERT INTO usernames (first_name, last_name) VALUES ($1, $2) RETURNING id';

    client.query(input, [firstName, lastName], function(error, results) {
      console.log(results.rows);
      res.cookie("id",results.rows[0].id);
      client.end();
      res.render("moar");
    });
  });
}

function modifyUser(age, city, homepage, color, id) {
    var client = new pg.Client("postgres://spiced:spiced1@localhost:5432/Users");
    client.connect(function(error) {
        if (error) {
            console.log("cant connect to database");
            throw error;
        }
        var putin = "INSERT INTO user_profiles (age, city, homepage, color, usernames_id) VALUES ($1, $2, $3, $4, $5)";

        client.query(putin, [age, city, homepage, color, id], function(error, results) {
            // console.log(results.rows);
            client.end();
        });
    });
}

app.post ("/name", function(req, res, next) {
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    res.cookie("firstName", firstName);
    res.cookie("lastName", lastName);
    feedMeArrays.firstName = firstName;
    addUser(firstName,lastName,res);
});

app.post ("/moar", function (req, res, next) {
    var age = req.body.age,
    city = req.body.city,
    homepage = req.body.homepage,
    color = req.body.color,
    id = req.cookies.id;
    modifyUser(age,city,homepage,color,id);
    res.render("hello", feedMeArrays);
})

// app.post ()

app.get("/hello", function (req, res) {
    res.render("hello", feedMeArrays);
});


app.listen(9002);

console.log("go away");
