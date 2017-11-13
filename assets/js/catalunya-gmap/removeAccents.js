/*! Generated 13-11-2017 */

function removeAccents(e){for(value=e.replace("(",""),value=value.replace(")",""),value=value.replace("*",""),c="áàãâäéèêëíìîïóòõôöúùûüçÁÀÃÂÄÉÈÊËÍÌÎÏÓÒÕÖÔÚÙÛÜÇ",s="aaaaaeeeeiiiiooooouuuucAAAAAEEEEIIIIOOOOOUUUUC",n="",i=0;i<value.length;i++)c.search(value.substr(i,1))>=0?n+=s.substr(c.search(value.substr(i,1)),1):n+=value.substr(i,1);return n}