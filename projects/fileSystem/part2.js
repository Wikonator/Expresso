var fs = require("fs");

var myHeart = {

};

(function walkThePath (path, lastObj) {
    var fileinfo = fs.readdirSync(path)
    // console.log(fileinfo);
    for (var z = 0 ; z < fileinfo.length ; z++) {
        var thisPath = path + "/" + fileinfo[z]
        var love = fs.statSync(thisPath);
        // console.log(fileinfo[z]);
        // console.log(thisPath);
        if (love.isDirectory()) {
            // console.log(path + "/" + fileinfo[z]);
            lastObj[fileinfo[z]] = {};
            walkThePath(thisPath, lastObj[fileinfo[z]]);
        } else {
            lastObj[fileinfo[z]] = love.size;
        }
    }

})(".", myHeart);

JSON.stringify(myHeart, null, 4);

fs.writeFile("./myHeart.JSON", myHeart, console.log("it's saved!"));
