export default function handleSearchTextList(event) {
    let filter, ul, li, value, i;
    filter = removeAccents(event.target.value).toUpperCase();
    ul = document.getElementById("mapLlist");
    li = ul.getElementsByTagName('li');

    // Loop through all list items, and hide those who don't match the search query
    for (i = 0; i < li.length; i++) {
        value = removeAccents(li[i].innerHTML);

        if (value !== '') {
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

function removeAccents(p) {
    let value = p.replace("(", "");
    value = value.replace(")","");
    value = value.replace("*",""); //Fix capella sense nom

    let c = 'áàãâäéèêëíìîïóòõôöúùûüçÁÀÃÂÄÉÈÊËÍÌÎÏÓÒÕÖÔÚÙÛÜÇ';
    let s = 'aaaaaeeeeiiiiooooouuuucAAAAAEEEEIIIIOOOOOUUUUC';
    let n = '';
    for (let i = 0; i < value.length; i++) {
        if (c.search(value.substr(i, 1)) >= 0) {
            n += s.substr(c.search(value.substr(i, 1)), 1);
        } else {
            n += value.substr(i, 1);
        }
    }
    return n;
}


