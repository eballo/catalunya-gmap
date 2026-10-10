import MonumentBuilder from './catalunya-gmap-monument'
import handleSearchTextList from './catalunya-gmap-extra'


async function initMapApplication() {
    try {
        const monument = new MonumentBuilder('gMap');
        window.cmGmapManager = monument.mapManager;
        const mapManager = await monument.create();

        if (mapManager.getMarkers().length > 0) {
            $("#error").hide();
        }

        $(window).resize(function () {
            mapManager.resize();
        })

        /**
         * Full Screen event
         * On full screen we remove the list icon
         */
        $(document).bind('webkitfullscreenchange mozfullscreenchange fullscreenchange', function () {
            const isFullScreen = document.fullScreen ||
                document.mozFullScreen ||
                document.webkitIsFullScreen;
            if (isFullScreen) {
                $('#llistat').hide();
            } else {
                $('#llistat').show();
            }
        });

    } catch (error) {
        console.error("Failed to load the Google Maps API", error);
    }
}
document.addEventListener('DOMContentLoaded', async () => {
    await initMapApplication()

    // --- Search List -----
    // #search-list as in catalunya-omap; #search-llista is what the theme's
    // gmap templates still print.
    document.querySelectorAll('#search-list, #search-llista').forEach(input => {
        input.addEventListener('blur', handleSearchTextList);
        input.addEventListener('input', handleSearchTextList);
    });
});

export default initMapApplication;