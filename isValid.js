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

function getType() {
    
    if (window.location.href.indexOf("www.rtp.pt/play") >= 0) {
        return 'RTPPlay';
    }

    return "unknown";
}

function newIsValid() {
    
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

function newIsValidAndGetType(callback) {
    
    if (window.location.href.indexOf("www.rtp.pt/play") >= 0) {
        // might be an RTPPlay file
    
        if (document === undefined) {
            return callback(false);
        }
        
        var scriptTags = document.getElementsByTagName('script');
        
        if (scriptTags === undefined) {
            return callback(false);
        }
        
        for (var i = 0 ; i < scriptTags.length ; i++) {
            
            var text = scriptTags[i].text;

            if (text.length !== 0
                && text.indexOf('RTPPlayer') >= 0
                && isValidRTPPlay(text) === true) {
                return callback(true, 'RTPPlay');
            }
        }
    }

    return callback(false);
}

var isOk = newIsValid();
var type = getType();

chrome.runtime.sendMessage({MessageType: 'isValid', isValid: isOk, type: type}, function(response) {});
