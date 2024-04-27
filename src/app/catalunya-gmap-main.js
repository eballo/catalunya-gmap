import MonumentBuilder from './catalunya-gmap-monument'

async function initMapApplication() {
    try {
        const monument = new MonumentBuilder('gMap');
        const map = await monument.create()

        if (map._getMarkers().length > 0) {
            $("#error").hide();
        }

        $(window).resize(function() {
            map._resize();
        })

    } catch (error) {
        console.error("Failed to load the Google Maps API", error);
    }
}

document.addEventListener('DOMContentLoaded', initMapApplication);