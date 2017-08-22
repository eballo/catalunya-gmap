(function(window, edifici, gmap) {


    //Create the map
    map = gmap.create('gMap', gmap.MAP_OPTIONS, gmap.CONFIG_OPTIONS);

    //Load the configuration of the map
    var edifici = edifici.create(map, gmap.CONFIG_OPTIONS);

    edifici.addMilitars();
    edifici.addCivils();
    edifici.addReligioses();
    edifici.addAltres();

    //To fit bounds
    map._resize(true);

    if (map._getMarkers().length() > 0) {
        $("#error").hide();
    }

    $(window).resize(function() {
        //console.log("window resize!")
        map._resize();
    })

}(window, window.Edifici, window.Gmap));

/**
 * Search function
 */
function search() {
    // Declare variables
    var input, filter, ul, li, value, i;
    input = document.getElementById('search');
    filter = input.value.toUpperCase();
    ul = document.getElementById("mapLlist");
    li = ul.getElementsByTagName('li');

    // Loop through all list items, and hide those who don't match the search query
    for (i = 0; i < li.length; i++) {
        value = li[i].innerHTML
        if (value.toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = "";
        } else {
            li[i].style.display = "none";
        }
    }
}

/** Full Screen event */
/**
 * On full screen we remove the list icon
 */
$(document).bind('webkitfullscreenchange mozfullscreenchange fullscreenchange', function() {
    var isFullScreen = document.fullScreen ||
        document.mozFullScreen ||
        document.webkitIsFullScreen;
    if (isFullScreen) {
        $('#llistat').hide();
    } else {
        $('#llistat').show();
    }
});
