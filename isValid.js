// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

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

                        isFound = true;
                    }
                    else if (link.indexOf('.mp3') >= 0) { // is audio file

                        isFound = true;
                    }
                }
            }
        }
    }
}

chrome.runtime.sendMessage({MessageType: 'isValid', isValid: isFound}, function(response) {});