// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

String.prototype.indexOfEx = function(text) {
    var target = this;
    return target.indexOf(text) + text.length;
};

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

function isValidRTPPlayScript(scriptText) {
    var link = getRTPPlayLinkFromScript(scriptText);
    
    if (link === undefined) {
        return false;
    }
    else {
        return true;
    }
}

function getType() {
    
    if (window.location.href.indexOf("www.rtp.pt/play") >= 0) {
        return 'RTPPlay';
    }

    return "unknown";
}

function isValid(doc) {
    
    var type = getType();
    
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

    return false;
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

function sendIsAllValidMessage(isValid) {
    chrome.runtime.sendMessage({MessageType: 'isAllValid', isValid: isValid}, function(response) {});
}

function isEpisodeItemValid(episodeItems, it) {
    
    getDocumentInUrl(window.location.origin + episodeItems[it].getAttribute("href"), function(doc) {

        if (isValid(doc) === true) {
            sendIsAllValidMessage(true);
        }
        else {
            var nextIt = it + 1;
            
            if (nextIt === episodeItems.length) {
                sendIsAllValidMessage(false);
            }
            else {
                isEpisodeItemValid(episodeItems, nextIt);
            }
        } 
    });
}

if (getType() !== 'RTPPlay') {
    sendIsAllValidMessage(false);
} 
else {

    var episodeItems = document.getElementsByClassName('episode-item');

    if (episodeItems.length === 0) {
        sendIsAllValidMessage(false);
    }
    else {
        isEpisodeItemValid(episodeItems, 0);
    }
}