// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

String.prototype.indexOfEx = function(text) {
    var target = this;
    return target.indexOf(text) + text.length;
};

function download(link, filename) {
    
    //console.log('filename = ' + filename);
    //console.log('link = ' + link);
    chrome.runtime.sendMessage({linkSubString: link, filename: filename}, function(response) { });
}

function downloadRTPPlayFromDocument(doc, filename) {
    
    var rtpPlayFileLinks = getRTPPlayFileLinks(doc);

    if (rtpPlayFileLinks.length === 0) {
        alert('No RTPPlayer file found');
    }
    else {

        for (var i = 0 ; i < rtpPlayFileLinks.length ; i++) {

            var link = rtpPlayFileLinks[i];

            if (link.indexOf('.mp4') >= 0) { // is video file
                filename = filename + ".mp4";

            }
            else if (link.indexOf('.mp3') >= 0) { // is audio file
                filename = filename + ".mp3";
            }

            download(link, filename);
        }
    }
}

function getTabTitle(doc) {
    return doc.getElementsByTagName('title')[0].text
        .replaceAll('-',' ')
        .replaceAll(':',' ')
        .replaceAll('\\|',' ')
        .replace(/\s{2,}/g,' ')
        .replaceAll(' ', '.')
        .replaceAll('.RTP.Play.RTP', '')
        .normalize('NFD').replace(/[\u0300-\u036f]/g, "");
}

function getPaginationType(doc) {

    var mainElems = doc.getElementsByClassName("bg-dark-gray");
    
    for (var i = 0 ; i < mainElems.length ; i++) {
        
        var mainPaginationContainers = mainElems[i].getElementsByClassName("container");
        
        for (var j = 0 ; j < mainPaginationContainers.length ; j++) {

            var mainPaginations = mainPaginationContainers[j].getElementsByClassName("pagination");

            for (var l = 0 ; l < mainPaginations.length ; l++) {

                var itemElem = mainPaginations[l].getElementsByTagName("li");

                for (var m = 0 ; m < itemElem.length ; m++) {

                    var items = itemElem[m].getElementsByTagName("a");

                    for (var n = 0 ; n < items.length ; n++) {

                        if (items[n].getAttribute("href") !== undefined) {
                            return 1;
                        }
                    }
                }
            }
        }
    }
    
    // version 2         
    var mainPaginationContainers = doc.getElementsByClassName("section-parts");

    for (var j = 0 ; j < mainPaginationContainers.length ; j++) {

        var mainPaginations = mainPaginationContainers[j].getElementsByClassName("parts");

        for (var l = 0 ; l < mainPaginations.length ; l++) {

            var itemElem = mainPaginations[l].getElementsByTagName("li");

            for (var m = 0 ; m < itemElem.length ; m++) {

                var items = itemElem[m].getElementsByTagName("a");

                for (var n = 0 ; n < items.length ; n++) {

                    if (items[n].getAttribute("href") !== undefined) {
                        return 2;
                    }
                }
            }
        }
    }
    
    return 0;
}

function getRTPPlayPaginationLinks(doc) {
    
    var rtpPlayLinks = [];

    var mainElems = doc.getElementsByClassName("bg-dark-gray");
    
    for (var i = 0 ; i < mainElems.length ; i++) {
        
        var mainPaginationContainers = mainElems[i].getElementsByClassName("container");
        
        for (var j = 0 ; j < mainPaginationContainers.length ; j++) {

            var mainPaginations = mainPaginationContainers[j].getElementsByClassName("pagination");

            for (var l = 0 ; l < mainPaginations.length ; l++) {

                var itemElem = mainPaginations[l].getElementsByTagName("li");

                for (var m = 0 ; m < itemElem.length ; m++) {

                    var items = itemElem[m].getElementsByTagName("a");

                    for (var n = 0 ; n < items.length ; n++) {

                        if (items[n].getAttribute("href") !== undefined) {
                            
                            rtpPlayLinks.push({
                                link: window.location.origin + items[n].getAttribute("href"),
                                part: "P" + items[n].innerHTML.replaceAll('Parte',' ').replace(/\s/g, '')
                            });
                        }
                    }
                }
            }
        }
    }
    
    return rtpPlayLinks;
}

function getRTPPlayPaginationLinksType2(doc) {
    
    var rtpPlayLinks = [];
    
    var mainPaginationContainers = doc.getElementsByClassName("section-parts");

    for (var j = 0 ; j < mainPaginationContainers.length ; j++) {

        var mainPaginations = mainPaginationContainers[j].getElementsByClassName("parts");

        for (var l = 0 ; l < mainPaginations.length ; l++) {

            var itemElem = mainPaginations[l].getElementsByTagName("li");
            
            for (var m = 0 ; m < itemElem.length ; m++) {

                var items = itemElem[m].getElementsByTagName("a");
                
                if (items.length === 0) {

                    var spans = itemElem[m].getElementsByTagName("span");
                    
                    for (var n = 0 ; n < spans.length ; n++) {
                        rtpPlayLinks.push({
                            link: window.location.href,
                            part: "P" + spans[n].innerHTML.replaceAll('Parte',' ').replaceAll('PARTE',' ').replace(/\s/g, '')
                        });
                    }
                }
                else {

                    for (var n = 0 ; n < items.length ; n++) {

                        if (items[n].getAttribute("href") !== undefined) {
                            rtpPlayLinks.push({
                                link: window.location.origin + items[n].getAttribute("href"),
                                part: "P" + items[n].innerHTML.replaceAll('Parte',' ').replaceAll('PARTE',' ').replace(/\s/g, '')
                            });
                        }
                    }
                }
            }
        }
    }
    
    return rtpPlayLinks;
}

function getRTPPlayLinkFromScript(scriptText) {
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

function getRTPPlayFileLinks(doc) {
    
    var rtpPlayLinks = [];
    
    if (isValid(doc) && getType() === 'RTPPlay') {
        
        var scriptTags = doc.getElementsByTagName('script');
        
        if (scriptTags === undefined) {
            return rtpPlayLinks;
        }
        
        for (var i = 0 ; i < scriptTags.length ; i++) {
            
            var link = getRTPPlayLinkFromScript(scriptTags[i].text);
    
            if (link !== undefined) {
                rtpPlayLinks.push(link);
            }
        }
        
    }
    
    return rtpPlayLinks;
}

function isValidRTPPlayScript(scriptText) {
    var link = getRTPPlayLinkFromScript(scriptText);
    
    if (link === undefined) {
        return false;
    }
    else {
        return true;
    }
}

function isValid(doc) {
    
    var type = getType();
    
    if (type === 'RTPPlay') {
        // might be an RTPPlay file
    
        if (document === undefined) {
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
            
            var link = window.location.protocol + videoTags[i].getAttribute("src");

            if (videoTags[i].getAttribute("src") !== undefined) {
                return true;
            }
        }
    }

    return false;
}

function getType() {
    
    if (window.location.href.indexOf("www.rtp.pt/play") >= 0) {
        return 'RTPPlay';
    }
    
    if (window.location.host.indexOf("sicradical.sapo.pt") >= 0) {
        return 'SICRadical';
    }
    
    if (window.location.host.indexOf("sicnoticias.sapo.pt") >= 0) {
        return 'SICNoticias';
    }
    
    if (window.location.host.indexOf("sic.sapo.pt") >= 0) {
        return 'SIC';
    }

    return "unknown";
}

function getDocumentPartInUrl(url, part, callback) {
    var xmlhttp;
    if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp = new XMLHttpRequest();
    }
    else {// code for IE6, IE5
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    
    xmlhttp.onreadystatechange=function() {
        if (xmlhttp.readyState==4 && xmlhttp.status==200) {
            return callback(part, new DOMParser().parseFromString(xmlhttp.responseText, 'text/html'));
        }
    }
    xmlhttp.open("GET", url, false);
    xmlhttp.send();
}

function getSICFileLinks(doc) {
    
    var sicLinks = [];
    
    if (isValid(doc) && getType().indexOf('SIC') >= 0) {
        
        var videoTags = doc.getElementsByTagName('video');
        
        if (videoTags === undefined) {
            return sicLinks;
        }

        for (var i = 0 ; i < videoTags.length ; i++) {

            var link = window.location.protocol + videoTags[i].getAttribute("src");
            
            if (videoTags[i].getAttribute("src") !== undefined) {
                sicLinks.push(link);
            }
        }        
    }
    
    return sicLinks;
}

function downloadSICFromDocument(doc, filename) {
    
    var sicFileLinks = getSICFileLinks(doc);

    if (sicFileLinks.length === 0) {
        alert('No SIC file found');
    }
    else {

        for (var i = 0 ; i < sicFileLinks.length ; i++) {

            var link = sicFileLinks[i];
            
            var ext = link.substr(link.lastIndexOf('.'), link.length);
            
            if (ext.indexOf('/net_wide') >= 0) {
                ext = ext.substr(0, ext.indexOf('/net_wide'));
            }
            if (ext.length >= 4) {
                ext = "";
            }

            filename = filename + ext;
            
            if ((filename.length - filename.lastIndexOf('.')) > 4) {
                // does not have extension
                filename = filename + ".mp4";
            }

            download(link, filename);
        }
    }  
    
}

var isOk = isValid(document);
    
if (isOk === false) {
    alert('No file found');
}
else {
    var type = getType();

    if (type === 'RTPPlay') {
        
        var paginationType = getPaginationType(document);
        
        if (paginationType === 0) {
            downloadRTPPlayFromDocument(document, getTabTitle(document));
        }           
        else if (paginationType === 1) {
            var rtpPlayPaginationLinks = getRTPPlayPaginationLinks(document);
            
            if (rtpPlayPaginationLinks.length === 0) {
                alert('No Pagination files found');
            }
            else {

                for (var i = 0 ; i < rtpPlayPaginationLinks.length ; i++) {
                    
                    getDocumentPartInUrl(rtpPlayPaginationLinks[i].link, rtpPlayPaginationLinks[i].part, function(part, doc) {

                        downloadRTPPlayFromDocument(document, getTabTitle(document) + "." + part);
                    });
                }
            }
        }
        else if (paginationType === 2) {
            var rtpPlayPaginationLinks = getRTPPlayPaginationLinksType2(document);

            if (rtpPlayPaginationLinks.length === 0) {
                alert('No Pagination files found');
            }
            else {

                for (var i = 0 ; i < rtpPlayPaginationLinks.length ; i++) {

                    getDocumentPartInUrl(rtpPlayPaginationLinks[i].link, rtpPlayPaginationLinks[i].part, function(part, pdoc) {

                        downloadRTPPlayFromDocument(pdoc, getTabTitle(document) + "." + part);
                    });
                }
            }
        }
    } else if (type.indexOf('SIC') >= 0) {
        
        downloadSICFromDocument(document, getTabTitle(document));
    }
    else {
        alert('No valid file found'); 
    }
}
