(function(window, edifici, catmap) {

    
    //Create the map
	var map = catmap.create('gMap',catmap.MAP_OPTIONS);
    
	//Load the configuration of the map
	var edifici = edifici.create(map);

	edifici.addMilitars();
	edifici.addCivils();
	edifici.addReligioses();
    
    //Add some behave
    $("#fullScreen").click(function() {
        $("#title-h1").slideToggle("slow");
        $("#title-h4").slideToggle("slow");
        $("#mapContainer").toggleClass('fullscreen');
        $("#gMap").toggleClass('fullscreen');
        map._resize();
    });
    
    $(window).resize(function(){
        console.log("window resize!")
        map._resize();
    })
	
}(window, window.Edifici, window.Catmap));
