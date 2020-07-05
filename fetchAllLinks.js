// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

function main() {

    var isOk = isValid(document);

    if (isOk === false) {
        alert('No file found');
        return
    }
    
    var type = getDataType();

    if (type === 'RTPPlay') {
        // listProgramsContent
        // selection-section

        var episodeItems = document.getElementsByClassName('episode-item');

        if (episodeItems.length == 0) {
            alert('No episode file found');
            return
        }
        
        var urls = [];
        
        for (var i = 0 ; i < episodeItems.length ; i++) {
            var href = episodeItems[i].getAttribute("href");
            
            if (href != null) {
                urls.push(window.location.origin + href);
            }
            else {
                urls.push(window.location.href);
            }            
        }

        if (urls.length == 0) {
            alert('No episode file found');
            return
        }
        
        var excludeUrls = [];
        var excludeEpisodesSection = document.getElementsByClassName('selection-section');

        if (excludeEpisodesSection.length > 0) {
            var excludeEpisodeItems = excludeEpisodesSection[0].getElementsByClassName('episode-item');
            
            for (var i = 0 ; i < excludeEpisodeItems.length ; i++) {
                var href = excludeEpisodeItems[i].getAttribute("href");

                if (href != null) {
                    var excludeUrl = window.location.origin + href
                    excludeUrls.push(excludeUrl)
                }
            }
            function exclude(value) {
              return excludeUrls.includes(value) === false;
            }
            
            urls = urls.filter(exclude)
        }
        
        

        for (var i = 0 ; i < urls.length ; i++) {

            getDocumentInUrl(urls[i], function(ddoc, url) {

                downloadEntireRTPPlayFromDocument(ddoc, url)
            });
        }
        return
    }
    else {
        alert('No valid file found');
    }
}

/***************************************************************/
/***************************************************************/

main()
