

'use strict';

/***********************/
/***    UTILITIES    ***/
/***********************/


/*export const */ String.prototype.indexOfEx = function(text) {
    var target = this;
    return target.indexOf(text) + text.length;
};

/*export const */ String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

/*export const */ function getDocumentInUrl(url, callback, part) {
    var xmlhttp;
    if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp = new XMLHttpRequest();
    }
    else {// code for IE6, IE5
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    
    xmlhttp.onreadystatechange=function() {
        if (xmlhttp.readyState==4 && xmlhttp.status==200) {
            return callback(new DOMParser().parseFromString(xmlhttp.responseText, 'text/html'), url, part);
        }
    }
    xmlhttp.open("GET", url, false);
    xmlhttp.send();
}

/*export const */ function getTabTitle(doc) {
    return doc.getElementsByTagName('title')[0].text
        .replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '')
        .replaceAll('-',' ')
        .replaceAll(':',' ')
        .replaceAll('\\|',' ')
        .replace(/\s{2,}/g,' ')
        .replaceAll(' ', '.')
        .replaceAll('.RTP.Play.RTP', '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, "");
}

/***********************/
/*****    COMMON    ****/
/***********************/

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

/*export const */ function isValid(doc) {
    
    var type = getDataType();
    
    if (type === 'RTPPlay') {
        // might be an RTPPlay file
    
        if (doc === undefined) {
            return false;
        }
        
        var scriptTags = doc.getElementsByTagName('script');
        
        if (scriptTags === undefined) {
            return false;
        }
        
        for (var i = 0 ; i < scriptTags.length ; i++) {
            
            var text = scriptTags[i].text;

            if (isValidRTPPlayScript(text) === true) {
                return true;
            }
        }
    }
    else if (type.indexOf('SIC') >= 0) {
        // might be a SIC file
    
        if (doc === undefined) {
            return false;
        }
        
        var videoTags = doc.getElementsByTagName('video');
        
        if (videoTags === undefined) {
            return false;
        }
        
        for (var i = 0 ; i < videoTags.length ; i++) {

            if (isValidSICVideoTag(videoTags[i]) === true) {
                return true;
            }
            
            var link = window.location.protocol + videoTags[i].getAttribute("src");

            if (videoTags[i].getAttribute("src") !== undefined) {
                return true;
            }
        }
    }

    return false;
}

/***********************/
/***    RTP Play    ****/
/***********************/

/*export const */ function getRTPPlayLinkFromScript(scriptText) {
    if (scriptText === undefined || 
        scriptText.length === 0 || 
        scriptText.indexOf('RTPPlayer({') < 0) {
        return undefined;
    }
    
    var rtpPlayerSubString = scriptText.substring(scriptText.indexOfEx('RTPPlayer({'), scriptText.lastIndexOf('})'));
    
    if (rtpPlayerSubString.indexOf('.mp4') >= 0) {  // is video file
        
        if (rtpPlayerSubString.indexOf('fileKey: \"') >= 0) {
            
            var link = rtpPlayerSubString.substr(
                rtpPlayerSubString.indexOfEx('fileKey: \"'), 
                rtpPlayerSubString.substr(rtpPlayerSubString.indexOfEx('fileKey: \"')).indexOf('\",'));
            
            return "http://cdn-ondemand.rtp.pt" + link;
        }
        
    }
    else if (rtpPlayerSubString.indexOf('.mp3') >= 0) { // is audio file

        if (rtpPlayerSubString.indexOf('file: \"') >= 0) {

            return rtpPlayerSubString.substr(
                rtpPlayerSubString.indexOfEx('file: \"'), 
                rtpPlayerSubString.substr(rtpPlayerSubString.indexOfEx('file: \"')).indexOf('\",'));
            
        }
    }
    
    return undefined;
}

/*export const */ function isValidRTPPlayScript(scriptText) {
    var link = getRTPPlayLinkFromScript(scriptText);
    
    if (link === undefined) {
        return false;
    }
    else {
        return true;
    }
}

/***********************/
/******    SIC    ******/
/***********************/

/*export const */ function isValidSICVideoTag(videoTag) {
    
    if (videoTag === undefined) {
        return false;
    }
    
    if (videoTag.getAttribute("src") === undefined) {
        return false;
    }
    else {
        return true;
    }
}