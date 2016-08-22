(function () {
        var docuHigh = $( document ).height();
    var whatComesIn = $("#input");
    var showtime = $("#resultsBoard");
    var resFor = $("#resultsFor");
    var template = $("#kidMeNot").html();
    var compilationHere = Handlebars.compile(template);
    var selecta  = $("#select")
    var nextToCome
    var arr = [];
    function goGetIt(result) {
         console.log(result)
         nextToCome = result[selecta.val() + "s"].next;
         var whatIGot = result[selecta.val() + "s"].items;
         console.log(whatIGot);
         if (whatIGot.length == 0) {
             $("#resultsBoard").append("<li>" + "Nothing here Boss, I even checked the shed where you keep the bodies..." + "</li>")
         } else {
             (function feedMe (whatIGot) {
                 for (var i = 0; i < whatIGot.length; i++) {
                     var img = whatIGot[i].images[0] && whatIGot[i].images[0].url;
                     if (typeof img == "undefined") {
                         img = "https://upload.wikimedia.org/wikipedia/commons/d/d4/Kim_Jong-Un_Photorealistic-Sketch.jpg"
                     }
                     var spotifyURL = whatIGot[i].external_urls.spotify;
                     var name = whatIGot[i].name;
                     var obj = {name: name, spotifyURL: spotifyURL, img: img};
                     arr.push(obj);
                 };
                 var wannaUseU = compilationHere(arr);
                 $("#resultsBoard").html(wannaUseU);
                 $("#resultsFor").html("showing results for: " + whatComesIn.val());
             })(whatIGot);
           }
           var moar = $("#moar");
           moar.css("display", "block");
           moar.on("click", next);
           nextToCome = result[selecta.val() + "s"].next;
      };

    var request = $("#butt").on("click", function() {
        arr = [];
        $("li").remove();
        var artistOrAlbum = selecta.val();
        var name = encodeURIComponent(whatComesIn.val());
          $.get("https://api.spotify.com/v1/search", {
             q: name,
             type: artistOrAlbum
       }, goGetIt);
setInterval(longWayDown, 1500);
    });

    function next(nextToCome) {
       var nextOnes = nextToCome;
       console.log("I fired!");
       $.get(nextOnes, goGetIt);
}

function longWayDown() {
    var winHeight = $(window).height();
    var scrollHere = $(window).scrollTop();
        docuHigh = $( document ).height();
    if ( winHeight + scrollHere == docuHigh) {
        next(nextToCome);
    }
}

})();
