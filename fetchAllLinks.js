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
    //console.log('linkSubString = ' + link);
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
            return false;
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

    return false;
}

function getType() {
    
    if (window.location.href.indexOf("www.rtp.pt/play") >= 0) {
        return 'RTPPlay';
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

function getDocumentInUrl(url, callback) {
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

var isOk = isValid(document);
    
if (isOk === false) {
    alert('No file found');
}
else {
    var type = getType();
    
    if (type === 'RTPPlay') {

        var episodeItems = document.getElementsByClassName('episode-item');

        if (episodeItems.length == 0) {
            alert('No episode file found');
        }
        else {

            for (var i = 0 ; i < episodeItems.length ; i++) {

                getDocumentInUrl(window.location.origin + episodeItems[i].getAttribute("href"), function(doc) {

                    /**************************************************/
                    var paginationType = getPaginationType(doc);
                    
                    if (paginationType === 0) {
                        downloadRTPPlayFromDocument(doc, getTabTitle(doc));
                    }
                    else if (paginationType === 1) {
                        var rtpPlayPaginationLinks = getRTPPlayPaginationLinks(doc);

                        if (rtpPlayPaginationLinks.length === 0) {
                            console.log('no pagination files found');
                        }
                        else {

                            for (var i = 0 ; i < rtpPlayPaginationLinks.length ; i++) {

                                getDocumentPartInUrl(rtpPlayPaginationLinks[i].link, rtpPlayPaginationLinks[i].part, function(part, pdoc) {

                                    downloadRTPPlayFromDocument(pdoc, getTabTitle(doc) + "." + part);
                                });
                            }
                        }
                    }
                    else if (paginationType === 2) {
                        var rtpPlayPaginationLinks = getRTPPlayPaginationLinksType2(doc);

                        if (rtpPlayPaginationLinks.length === 0) {
                            console.log('no pagination files found');
                        }
                        else {

                            for (var i = 0 ; i < rtpPlayPaginationLinks.length ; i++) {

                                getDocumentPartInUrl(rtpPlayPaginationLinks[i].link, rtpPlayPaginationLinks[i].part, function(part, pdoc) {

                                    downloadRTPPlayFromDocument(pdoc, getTabTitle(doc) + "." + part);
                                });
                            }
                        }
                    }
                    /**************************************************/
                });
            }

        }
    }
    else {
        alert('No valid file found');
    }
}
