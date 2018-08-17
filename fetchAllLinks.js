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

function getTabTitle(d) {
    return d.getElementsByTagName('title')[0].text
        .replaceAll('-',' ')
        .replaceAll(':',' ')
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
    console.log('download -> ' + link + " = " + filename);
    chrome.runtime.sendMessage({linkSubString: link, filename: filename}, function(response) { });
}

function downloadRTPPlay(d, scriptText) {
    

    var rtpPlayerSubString = scriptText.substring(scriptText.indexOfEx('RTPPlayer({') , scriptText.lastIndexOf('})'));

    if (rtpPlayerSubString.indexOf('file: \"') >= 0) {

        var link = rtpPlayerSubString.substr(
            rtpPlayerSubString.indexOfEx('file: \"'), 
            rtpPlayerSubString.substr(rtpPlayerSubString.indexOfEx('file: \"')).indexOf('\",'));

        if (link.indexOf('.mp4') >= 0) { // is video file

            link = 
                link.substring(0, link.indexOf('index')) +
                link.substring(link.indexOfEx('streams='), link.indexOfEx('.mp4'));

            var filename = getTabTitle(d) + ".mp4";

            download(link, filename);

            return true;
        }
        else if (link.indexOf('.mp3') >= 0) { // is audio file

            var filename = getTabTitle(d) + ".mp3";

            download(link, filename);

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
    alert('No RTPPlayer file found');
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
                            isFound = downloadRTPPlay(d, scriptTags[i].text) || isFound;
                        }
                    }
                });
            }
            numberOfItemsConcluded = numberOfItemsConcluded + 1;
            if (numberOfItemsConcluded == numberOfItemsConcluded && isFound == false) {
                alert('No RTPPlayer file found');
            }
        });
    }
}
