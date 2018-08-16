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

function getTabTitle() {
    return document.getElementsByTagName('title')[0].text
        .replaceAll('-',' ')
        .replace(/\s{2,}/g,' ')
        .replaceAll(' ', '.')
        .normalize('NFD').replace(/[\u0300-\u036f]/g, "");
}

function isValid(scriptTags) {
    
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

function download(link, filename) {
    
    //console.log('filename = ' + filename);
    //console.log('linkSubString (audio) = ' + linkSubString);
    chrome.runtime.sendMessage({linkSubString: link, filename: filename}, function(response) { });
}

function downloadRTPPlay(scriptText) {
    

    var rtpPlayerSubString = scriptText.substring(scriptText.indexOfEx('RTPPlayer({') , scriptText.lastIndexOf('})'));

    if (rtpPlayerSubString.indexOf('file: \"') >= 0) {

        var link = rtpPlayerSubString.substr(
            rtpPlayerSubString.indexOfEx('file: \"'), 
            rtpPlayerSubString.substr(rtpPlayerSubString.indexOfEx('file: \"')).indexOf('\",'));

        if (link.indexOf('.mp4') >= 0) { // is video file

            link = 
                link.substring(0, link.indexOf('index')) +
                link.substring(link.indexOfEx('streams='), link.indexOfEx('.mp4'));

            var filename = getTabTitle() + ".mp4";

            download(link, filename);

            return true;
        }
        else if (link.indexOf('.mp3') >= 0) { // is audio file

            var filename = getTabTitle() + ".mp3";

            download(link, filename);

            return true;
        }
    }
    return false;
}

var scriptTags = document.getElementsByTagName('script');

var isFound = false;

for (var i = 0 ; i < scriptTags.length ; i++) {
    
    isValidAndGetType(scriptTags[i], function(isOk, type) {
        
        if (isOk) {
            
            if (type == 'RTPPlay') {
                isFound = downloadRTPPlay(scriptTags[i].text) || isFound;
            }
        }
    });
}
   
if (isFound == false) {
    alert('No RTPPlayer file found');
}
