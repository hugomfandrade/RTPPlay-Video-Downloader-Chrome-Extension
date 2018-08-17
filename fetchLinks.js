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

function getTabTitle(d) {
    return d.getElementsByTagName('title')[0].text
        .replaceAll('-',' ')
        .replaceAll(':',' ')
        .replace(/\s{2,}/g,' ')
        .replaceAll(' ', '.')
        .normalize('NFD').replace(/[\u0300-\u036f]/g, "");
}

function hasPagination() {

    var mainElems = document.getElementsByClassName("bg-dark-gray");
    
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
                            return true;
                        }
                    }
                }
            }
        }
    }
    
    return false;
}

function getRTPPlayPaginationLinks() {
    
    var rtpPlayLinks = [];

    var mainElems = document.getElementsByClassName("bg-dark-gray");
    
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

function getRTPPlayLinkFromScript(scriptText) {
    if (scriptText === undefined || 
        scriptText.length === 0 || 
        scriptText.indexOf('RTPPlayer({') < 0) {
        return undefined;
    }
    
    var rtpPlayerSubString = scriptText.substring(scriptText.indexOfEx('RTPPlayer({'), scriptText.lastIndexOf('})'));

    if (rtpPlayerSubString.indexOf('file: \"') >= 0) {

        var link = rtpPlayerSubString.substr(
            rtpPlayerSubString.indexOfEx('file: \"'), 
            rtpPlayerSubString.substr(rtpPlayerSubString.indexOfEx('file: \"')).indexOf('\",'));

        if (link.indexOf('.mp4') >= 0) { // is video file
            
            link = 
                link.substring(0, link.indexOf('index')) +
                link.substring(link.indexOfEx('streams='), link.indexOfEx('.mp4'));

            return link;
        }
        else if (link.indexOf('.mp3') >= 0) { // is audio file

            return link;
        }
    }
    return undefined;
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

function isValid() {
    
    var type = getType();
    
    if (type === 'RTPPlay') {
        // might be an RTPPlay file
    
        if (document === undefined) {
            return false;
        }
        
        var scriptTags = document.getElementsByTagName('script');
        
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

function getRTPPlayFileLinks(d) {
    
    var rtpPlayLinks = [];
    
    if (isValid() && getType() === 'RTPPlay') {
        
        var scriptTags = d.getElementsByTagName('script');
        
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

function getDocumentInUrl(url, part, callback) {
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

var isOk = isValid();
    
if (isOk === false) {
    alert('No file found');
}
else {
    var type = getType();

    if (type === 'RTPPlay') {
        
        if (hasPagination()) {
            var rtpPlayPaginationLinks = getRTPPlayPaginationLinks();
            
            if (rtpPlayPaginationLinks.length === 0) {
                alert('No Pagination files found');
            }
            else {

                for (var i = 0 ; i < rtpPlayPaginationLinks.length ; i++) {
                    
                    getDocumentInUrl(rtpPlayPaginationLinks[i].link, rtpPlayPaginationLinks[i].part, function(part, doc) {

                        downloadRTPPlayFromDocument(doc, getTabTitle(document) + "." + part);
                    });
                }
            }
        }
        else {
            downloadRTPPlayFromDocument(document, getTabTitle(document));
        }
    }
}
