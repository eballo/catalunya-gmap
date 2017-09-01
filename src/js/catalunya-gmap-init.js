(function(window, edifici, gmap) {


    //Create the map
    var map = gmap.create('gMap', gmap.MAP_OPTIONS, gmap.CONFIG_OPTIONS);

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
