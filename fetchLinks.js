// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

/*String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};/**/
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

function getTabTitle() {
    return document.getElementsByTagName('title')[0].text
        .replaceAll('-',' ')
        .replace(/\s{2,}/g,' ')
        .replaceAll(' ', '.')
        .normalize('NFD').replace(/[\u0300-\u036f]/g, "")
}

var scriptTags = document.getElementsByTagName('script');

var isFound = false;

for (var i = 0 ; i < scriptTags.length ; i++) {
    
    if (scriptTags[i] != undefined) {
        var text = scriptTags[i].text;

        if (text.length > 0) {

            if (text.indexOf('RTPPlayer') >= 0) {
                
                var rtpPlayerSubString = text.substring(
                    text.indexOf('RTPPlayer({') + 'RTPPlayer({'.length, 
                    text.lastIndexOf('})')
                );
                
                if (rtpPlayerSubString.indexOf('file: \"') >= 0) {

                    var link = rtpPlayerSubString.substr(
                        rtpPlayerSubString.indexOf('file: \"') + 'file: \"'.length, 
                        rtpPlayerSubString.substr(rtpPlayerSubString.indexOf('file: \"') + 'file: \"'.length).indexOf('\",')
                    );
                    
                    if (link.indexOf('.mp4') >= 0) { // is video file

                        var linkSubString = 
                            link.substring(
                                0, 
                                link.indexOf('index')
                            ) +
                            link.substring(
                                link.indexOf('streams=') + 'streams='.length, 
                                link.indexOf('.mp4') + '.mp4'.length
                            )
                        ;
                        
                        var filename = getTabTitle() + ".mp4";
                        
                        //console.log('filename = ' + filename);
                        //console.log('linkSubString (video) = ' + linkSubString);
                        
                        chrome.runtime.sendMessage({linkSubString: linkSubString, filename: filename}, function(response) { });

                        isFound = true;
                    }
                    else if (link.indexOf('.mp3') >= 0) { // is audio file
                        
                        var filename = getTabTitle() + ".mp3";
                        
                        //console.log('filename = ' + filename);
                        //console.log('linkSubString (audio) = ' + linkSubString);
                        chrome.runtime.sendMessage({linkSubString: link, filename: filename}, function(response) { });

                        isFound = true;
                    }
                }
            }
        }
    }
}
   
if (isFound == false) {
    alert('No RTPPlayer file not found');
}
