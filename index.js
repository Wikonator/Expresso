var express = require("express");

var app = express();
var cooks;

app.use(require("cookie-parser")());
console.log(require("cookie-parser")());

app.use(function(req, res, next){

    if (req.url == "/name.html" || req.url == "/name") {
        return next();
    }
    // console.log(typeof req.cookies.lastName);
    if (req.cookies.firstName === undefined || req.cookies.lastName === undefined) {
        console.log("a redirect fired dude");
        res.redirect("/name.html");
        return;
    }
    next();
});

app.use(express.static(__dirname + "/projects"));

app.use(require("body-parser").urlencoded({
    extended: false
}));



app.post ("/name", function(req, res, next) {
        res.cookie("firstName", req.body.firstName);
        res.cookie("lastName", req.body.lastName);
        res.redirect("/hello.html");
    // }
    // else {
    //     res.redirect(__dirname + "projects/name.html");
    //     console.log("no cookies - redirected to get some");
    // }
});


app.listen(9001);

console.log("zog em to gog!");
