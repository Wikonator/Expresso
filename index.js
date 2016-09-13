var express = require("express"),
redis = require("redis"),
cache = redis.createClient({
    host: "localhost",
    port: 6379
}),
session = require('express-session'),
Store = require('connect-redis')(session),
app = express(),
cooks,
handles = require("express-handlebars"),
fs = require("fs"),
feedMeArrays = {},
getTwitt = require("./getTwitt.js"),
https = require("https"),
crypt = require("bcrypt"),
pg = require("pg");


cache.on('error', function(err) {
    console.log(err);
});
// var twitterKey = require("./projects/ticker/main.json");

var arrayFromTwitter = [];

app.engine("handlebars", handles());
app.set("view engine", "handlebars");

app.use(session({
    store: new Store({
        ttl: 3000,
        host: 'localhost',
        port: 6379
    }),
    resave: false,
    saveUninitialized: true,
    secret: "Mr.Robot is Elliots dad"
}));

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
    // console.log(req.session);
    if (req.url == "/name.html" || req.url == "/name") {
        console.log("name blasted");
        return next();
    }
    if (req.url == "/login.html" || req.url == "/login") {
        // console.log(req.method);
        if (req.method == "POST") {
            console.log("these an email here!");
            return next();
        }
        return res.sendFile(__dirname + "/statics/login.html");
    }
    if (req.session.firstName === undefined || req.session.lastName === undefined) {
        return res.sendFile(__dirname + "/statics/name.html");
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
                firstName: req.session.firstName,
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
    var objectForHandlebars = {},
        allMyUsers = [],
        client = new pg.Client("postgres://spiced:spiced1@localhost:5432/Users"),
        checkEm;

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
        };
            cityItems = makeUniqueItems(cityItems),
            colorItems = makeUniqueItems(colorItems);
            objectForHandlebars = {
                city: cityItems,
                color: colorItems,
                myUsers: allMyUsers,
                cookieName : req.session.firstName
                };
            res.render("users", objectForHandlebars);
    };

    client.connect(function(err) {
        if (err) {
            console.log("couldnt connect to the tables yo");
            throw err;
        }

            if (Object.keys(req.query).length === 0) {
                cache.get("userProfiles", function(err, data){
                    console.log(err);
                    if (data !== null) {
                        console.log("cache just popped");
                        var results = JSON.parse(data);
                        res.render("users", results);
                        return;
                    }
                    client.query("SELECT * FROM users JOIN user_profiles ON usernames_id = users.id;"
                    , function(error, results) {
                        if (error) {
                            console.log("could not get usernames, fam");
                            throw error;
                        }
                        checkEm = results;
                        var cityItems = [],
                            colorItems = [];
                        createArrForHandlebars(checkEm);
                        cache.set("userProfiles", JSON.stringify(objectForHandlebars));
                        client.end();
                        return;
                    });
                });
            } else {
                var city = req.query.city,
                color = req.query.color,
                input = "SELECT * FROM users JOIN user_profiles ON usernames_id = users.id WHERE city = '" +city+"' AND color = '" + color+"';";
                client.query(input, function(err, results) {
                    if (err) {
                        console.log("couldnt get specified search");
                        throw err;
                    }
                    // console.log(checkEm);
                    checkEm = results;
                    createArrForHandlebars(checkEm);
                })
            }
    });
});

// app.post("/users", function(res, req) {
//
// });

function addUser(firstName, lastName, mail, password, res, req) {
  var client = new pg.Client("postgres://spiced:spiced1@localhost:5432/Users");
  client.connect(function(err) {
    if (err) {
      console.log("no connection happened");
      throw err;
    }
    var input = 'INSERT INTO users (first_name, last_name, email, password) VALUES ($1, $2, $3, $4) RETURNING id';

    client.query(input, [firstName, lastName, mail, password], function(error, results) {
        if (error) {
            return res.render("name", {error: "That email is already taken, fam!"})
        }
    //   console.log(results.rows);

      req.session.postgresID = results.rows[0].id;
    //   console.log(req.session.postgresID);
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

app.post("/logout", function(req,res) {
    req.session.destroy(function(err) {
        console.log(err);
    });
    console.log("session destroyed, returning to base");
    res.sendFile(__dirname + "/statics/login.html");
});


app.post("/login", function (req, res, next) {
    var mail = req.body.Email,
        pwrd = req.body.Password;
        // console.log(pwrd);
        function authentication(mail, pwrd) {
            var hashedPass = "";
            var client = new pg.Client("postgres://spiced:spiced1@localhost:5432/Users");
            client.connect(function(error) {
                if (error) {
                    console.log("can't connect to base, boss");
                    throw error;
                }
                client.query("SELECT * FROM users WHERE users.email ='" +mail+"';", function(error, results){
                    if (error) {
                        console.log(error);
                    }
                    var user = results.rows[0];
                    // console.log(user);
                    hashedPass = user.password;
                    // console.log(hashedPass);
                    client.end();
                    function comparePasses(pwrd, hashedPass, res) {
                        // console.log("comparing passwords");
                        crypt.compare(pwrd, hashedPass, function(err, doesMatch) {
                            if (err) {
                                return res.render("nope", {error: "I've got 99 passwords, but this ain't one"});
                            }
                            console.log(user);
                            req.session.firstName = user.first_name;
                            console.log(req.session.firstName);
                            req.session.lastName = user.last_name;
                            req.session.mail = user.email;
                            feedMeArrays.firstName = user.first_name;
                            res.render("hello", feedMeArrays);
                        })
                    }
                    comparePasses(pwrd, hashedPass, res);
                });

            })
        }
        authentication(mail,pwrd);
});

app.post ("/name", function(req, res, next) {
    var firstName = req.body.firstName,
        lastName = req.body.lastName,
        mail = req.body.mail,
        plainPassword = req.body.pwrd;
    req.session.firstName = firstName;
    req.session.lastName = lastName;
    req.session.mail = mail;
    feedMeArrays.firstName = firstName;

    function hashPass(plainPassword) {
        crypt.genSalt(function(err,salt) {
            if (err) {
                return err;
            }
            console.log(salt);
            crypt.hash(plainPassword, salt, function(err, hash) {
                if (err) {
                    return err;
                }
                console.log(hash);
                addUser(firstName, lastName, mail, hash, res, req);
            });
        });
    };

    hashPass(plainPassword);
});

app.post ("/moar", function (req, res, next) {
    var age = req.body.age,
    city = req.body.city,
    homepage = req.body.homepage,
    color = req.body.color,
    id = req.session.postgresID;
    console.log(req.session.postgresID);
    modifyUser(age,city,homepage,color,id);

    function deleteCache() {
        return new Promise(function(resolve, reject) {
            console.log("deleting cache");
            cache.del("userProfiles", function(err) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            })
        })
    }
    deleteCache().then(function() {
        res.render("hello", feedMeArrays);
    });
})

app.get("/hello", function (req, res) {
    res.render("hello", feedMeArrays);
});


app.listen(9002);

console.log("go away");
