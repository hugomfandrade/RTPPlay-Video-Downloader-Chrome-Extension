// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

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

function isValid(doc) {
    
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
            
            var link = window.location.protocol + videoTags[i].getAttribute("src");

            if (videoTags[i].getAttribute("src") !== undefined) {
                return true;
            }
        }
    }

    return false;
}

/***************************************************************/
/***************************************************************/

function isEpisodeValid(doc) {
    
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

    return false;
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

function sendIsAllValidMessage(isEpisodeOk) {

    var isOk = isValid(document);

    var type = getDataType();

    chrome.runtime.sendMessage({MessageType: 'isValid', 
                                type: type, 
                                isValid: isOk, 
                                isEpisodeValid: isEpisodeOk}, function(response) {});
}

function main() {

    if (getDataType() !== 'RTPPlay') {
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
}

/***************************************************************/
/***************************************************************/

main(document);

// require("backgroundDatatype.js");

/*import('./backgroundDatatype.js').then(module => {
    console.log("isValidAfterimport = " + module.getDataType());
});
import('./testImport.js').then(module => {
    console.log("isValidAfterimport = " + module.getDataType());
});*/
