// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

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
    
    getDocumentInUrl(window.location.origin + episodeItems[it].getAttribute("href"), function(doc, url) {

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
