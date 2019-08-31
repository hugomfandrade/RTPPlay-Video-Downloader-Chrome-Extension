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
        
        downloadEntireRTPPlayFromDocument(document, window.location.href)
        return
    } 
    else if (type.indexOf('SIC') >= 0) {

        downloadSICFromDocument(document, getTabTitle(document));
        return
    }
    else {
        alert('No valid file found'); 
        return
    }
}

/***************************************************************/
/***************************************************************/

main();
