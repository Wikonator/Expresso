var fs = require("fs");


(function carelessWhisper (path) {
    fs.readdir(path , function loopy (earl, data) {
        if (earl) {
            console.log(earl);
            process.exit;
        }
        console.log("Hi my name is " + path + " my content is " + data);
       data.forEach(function (currentItem) {
        //   console.log(z);
          var currentPath = path + "/" + currentItem;
                fs.stat(currentPath, function (err, fileinfo) {
                    if (err) {
                        console.log(err);
                        process.exit;
                    }
                        if (fileinfo.isDirectory()) {
                            // console.log(data[z]);
                            // console.log("I'm a dir and I contain: " + data);

                            carelessWhisper(currentPath);
                        } else {
                            return;
                        }
                });
         });
     });
})(".");
