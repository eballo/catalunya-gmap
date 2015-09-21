(function(window, edifici) {

	//load the configuration of the map
	var edifici = edifici.create('gMap');

	edifici.addMilitars();
	edifici.addCivils();
	edifici.addReligioses();
	
}(window, Edifici ));