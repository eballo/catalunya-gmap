/**
 * This file is already included in catalunyamedieval. Not needed to include
 */
function removeAccents(p) {
    value = p.replace("(", "");
    value = value.replace(")", "");
    value = value.replace("*", ""); //Fix capella sense nom

    c = 'áàãâäéèêëíìîïóòõôöúùûüçÁÀÃÂÄÉÈÊËÍÌÎÏÓÒÕÖÔÚÙÛÜÇ';
    s = 'aaaaaeeeeiiiiooooouuuucAAAAAEEEEIIIIOOOOOUUUUC';
    n = '';
    for (i = 0; i < value.length; i++) {
        if (c.search(value.substr(i, 1)) >= 0) {
            n += s.substr(c.search(value.substr(i, 1)), 1);
        } else {
            n += value.substr(i, 1);
        }
    }
    return n;
}
