/**
 * Search function
 */
function searchLlista() {
    // Declare variables
    var input, filter, ul, li, value, i;
    input = document.getElementById('search-llista');
    filter = removeAccents(input.value).toUpperCase();
    ul = document.getElementById("mapLlist");
    li = ul.getElementsByTagName('li');

    // Loop through all list items, and hide those who don't match the search query
    for (i = 0; i < li.length; i++) {
        value = removeAccents(li[i].innerHTML);

        if (value != '') {
            if (value.toUpperCase().indexOf(filter) > -1) {
                li[i].style.display = "";
            } else {
                li[i].style.display = "none";
            }
        } else {
            li[i].style.display = "";
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
