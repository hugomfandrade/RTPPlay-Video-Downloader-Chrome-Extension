// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

String.prototype.indexOfEx = function(text) {
    var target = this;
    return target.indexOf(text) + text.length;
};

function isValid(scriptTags, callback) {
    
    if (scriptTags == undefined) return false;
    
    var text = scriptTags.text;
    
    if (text.length == 0 || text.indexOf('RTPPlayer') < 0) return false;
    
    return true;
}

function isValidAndGetType(scriptTags, callback) {
    
    if (scriptTags == undefined) {
        return callback(false);
    }
    
    var text = scriptTags.text;
    
    if (text.length == 0) {
        return callback(false);
    }
    
    if (text.indexOf('RTPPlayer') >= 0) {
        return callback(true, 'RTPPlay');
    }

    return callback(false);
}

function isValidRTPPlay(scriptText) {
    
    var rtpPlayerSubString = scriptText.substring(scriptText.indexOfEx('RTPPlayer({') , scriptText.lastIndexOf('})'));

    if (rtpPlayerSubString.indexOf('file: \"') >= 0) {

        var link = rtpPlayerSubString.substr(
            rtpPlayerSubString.indexOfEx('file: \"'), 
            rtpPlayerSubString.substr(rtpPlayerSubString.indexOfEx('file: \"')).indexOf('\",'));

        if (link.indexOf('.mp4') >= 0) { // is video file

            return true;
        }
        else if (link.indexOf('.mp3') >= 0) { // is audio file

            return true;
        }
    }
    
    return false;
}

function httpGet(url, callback) {
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

var episodeItems = document.getElementsByClassName('episode-item');

if (episodeItems.length == 0) {
    chrome.runtime.sendMessage({MessageType: 'isAllValid', isValid: false}, function(response) {});
}
else {
    var isFound = false;

    var numberOfItemsConcluded = 0;
    
    for (var i = 0 ; i < episodeItems.length ; i++) {

        httpGet(window.location.origin + episodeItems[i].getAttribute("href"), function(d) {
            
            var scriptTags = d.getElementsByTagName('script');

            for (var i = 0 ; i < scriptTags.length ; i++) {

                isValidAndGetType(scriptTags[i], function(isOk, type) {

                    if (isOk) {
            
                        if (type == 'RTPPlay') {
                            isFound = isValidRTPPlay(scriptTags[i].text);
                        }
                    }
                });
            }  
            numberOfItemsConcluded = numberOfItemsConcluded + 1;
            if (numberOfItemsConcluded == numberOfItemsConcluded) {
                chrome.runtime.sendMessage({MessageType: 'isAllValid', isValid: isFound}, function(response) {});
            }          
        });
    }
    
}