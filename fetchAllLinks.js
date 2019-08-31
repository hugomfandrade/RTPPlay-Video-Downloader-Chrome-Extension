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

        var episodeItems = document.getElementsByClassName('episode-item');

        if (episodeItems.length == 0) {
            alert('No episode file found');
            return
        }
        

        for (var i = 0 ; i < episodeItems.length ; i++) {

            getDocumentInUrl(window.location.origin + episodeItems[i].getAttribute("href"), function(ddoc, url) {

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
