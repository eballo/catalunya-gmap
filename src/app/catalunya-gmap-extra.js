
export function stringToBoolean(value) {
    // Accepts a real boolean too, not just a string: config coming from
    // window.catalunyaGmapConfig (JS object literals emitted by PHP, e.g.
    // `userPosition: true`) is already a boolean, while config coming from
    // process.env (dotenv-webpack) is always a string — this function is
    // called with either.
    if (typeof value === "boolean") return value;
    if (!value) return false;
    return value.toLowerCase() !== "false";
}

export default function handleSearchTextList(event) {
    let filter, ul, li, value, i;
    filter = removeAccents(event.target.value).toUpperCase();
    ul = document.getElementById("map-list");
    if (!ul) return;
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

export function filterByField(markers, field, value) {
    if (!value) return markers;
    const target = removeAccents(value).trim().toUpperCase();
    return markers.filter(m => removeAccents(m[field] || '').trim().toUpperCase() === target);
}

export function filterByComarca(markers, comarca) {
    return filterByField(markers, 'comarca', comarca);
}

export function filterByMunicipi(markers, municipi) {
    return filterByField(markers, 'municipi', municipi);
}

// Mirrors WordPress's sanitize_title(): strip accents, drop apostrophes
// (no hyphen inserted — "Pla d'Urgell" -> "pla-durgell"), lowercase, replace
// any other run of non-alphanumeric characters with a single hyphen. Verified
// against all 43 real comarca slugs.
export function slugify(value) {
    return removeAccents(value || '')
        .replace(/['’]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export function removeAccents(p) {
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

/**
 * fetch() the map JSON, sending the host's nonce as X-CM-Nonce when set, so
 * the URL itself stays stable (cacheable, and no new crawler 403 per rotation).
 */
export function fetchMapData(url, nonce) {
    return nonce ? fetch(url, { headers: { 'X-CM-Nonce': nonce } }) : fetch(url);
}
