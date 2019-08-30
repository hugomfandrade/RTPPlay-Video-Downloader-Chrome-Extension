

'use strict';

String.prototype.indexOfEx = function(text) {
    var target = this;
    return target.indexOf(text) + text.length;
};

/*export const */ function getDataType() {
    
    if (window.location.href.indexOf("www.rtp.pt/play") >= 0) {
        return 'RTPPlay';
    }
    
    if (window.location.host.indexOf("sicradical.sapo.pt") >= 0 || window.location.host.indexOf("sicradical.pt") >= 0) {
        return 'SICRadical';
    }
    
    if (window.location.host.indexOf("sicnoticias.sapo.pt") >= 0 || window.location.host.indexOf("sicnoticias.pt") >= 0) {
        return 'SICNoticias';
    }
    
    if (window.location.host.indexOf("sic.sapo.pt") >= 0 || window.location.host.indexOf("sic.pt") >= 0) {
        return 'SIC';
    }

    return "unknown";
}

/*export const */ function getDocumentInUrl(url, callback) {
    var xmlhttp;
    if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp = new XMLHttpRequest();
    }
    else {// code for IE6, IE5
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    
    xmlhttp.onreadystatechange=function() {
        if (xmlhttp.readyState==4 && xmlhttp.status==200) {
            return callback(new DOMParser().parseFromString(xmlhttp.responseText, 'text/html'));
        }
    }
    xmlhttp.open("GET", url, false);
    xmlhttp.send();
}