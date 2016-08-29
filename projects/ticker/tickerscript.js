(function() {

    var tick = $("#ticker");
    var here = tick.offset().left;
    var links = [];
    var headers = [];

    $.getJSON("/tweets").then(tagify);

    // function transformObject(data) {
    //     var transformedData = [];
    //     for (var key in data) {
    //         var ourObject = {
    //             name: key,
    //             url: data[key]
    //         };
    //         transformedData.push(ourObject);
    //     }
    //     tagify(transformedData);
    // }


function tagify(data) {
    // data = data.array;
    console.log(data);
    var readyToUse = fillThePlaceholders(data);
    tick.html(readyToUse);
 }



var template = $("#scriptie").html();
var fillThePlaceholders = Handlebars.compile(template);


     var getJiggy = function() {
       var numberNew = here - 2 ;
        here = numberNew;
        tick.css("left", numberNew + "px");
        animation = window.requestAnimationFrame(getJiggy);
      };

    var animation = window.requestAnimationFrame(getJiggy);

    // tick.addEventListener("mouseover", stopThisMaddness);
    // tick.addEventListener("mouseleave", getJiggy);


    function stopThisMaddness() {
      window.cancelAnimationFrame(animation);
}

headlines = $("#a").html;
tick.hover(stopThisMaddness, getJiggy);
})();
