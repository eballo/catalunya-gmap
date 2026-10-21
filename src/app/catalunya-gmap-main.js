import MonumentBuilder from './catalunya-gmap-monument'
import handleSearchTextList from './catalunya-gmap-extra'


async function initMapApplication() {
    try {
        const monument = new MonumentBuilder('gMap');
        window.cmGmapManager = monument.mapManager;
        const mapManager = await monument.create();

        if (mapManager.getMarkers().length > 0) {
            const error = document.getElementById('error');
            if (error) {
                error.style.display = 'none';
            }
        }

        window.addEventListener('resize', () => {
            mapManager.resize();
        });

        /**
         * Full Screen event
         * On full screen we remove the list icon
         */
        const toggleListOnFullScreen = () => {
            const isFullScreen = document.fullScreen ||
                document.mozFullScreen ||
                document.webkitIsFullScreen;
            const list = document.getElementById('llistat');
            if (list) {
                list.style.display = isFullScreen ? 'none' : '';
            }
        };
        ['webkitfullscreenchange', 'mozfullscreenchange', 'fullscreenchange'].forEach((name) => {
            document.addEventListener(name, toggleListOnFullScreen);
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