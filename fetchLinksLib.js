// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

/***********************/
/*****    COMMON    ****/
/***********************/

function download(link, filename) {
            
    // console.log("filename = " + filename)
    // console.log("link = " + link)
    
    chrome.runtime.sendMessage({MessageType: 'download', link: link, filename: filename}, function(response) { });
}

/***********************/
/***    RTP Play    ****/
/***********************/

function downloadRTPPlayFromDocument(doc, filename) {
    
    var rtpPlayFileLinks = getRTPPlayFileLinks(doc);

    if (rtpPlayFileLinks.length === 0) {
        alert('No RTPPlayer file found');
    }
    else {

        for (var i = 0 ; i < rtpPlayFileLinks.length ; i++) {

            var link = rtpPlayFileLinks[i];            
            var baseLink = link.substr(0, link.lastIndexOf("/")) + "/"
            
            // console.log("link = " + link)
            // console.log("baseLink = " + baseLink)

            if (link.indexOf('.m3u8') >= 0) { // is video file
                // 
                // 
                // filename = filename + ".mp4";
     
                getFileInUrl(link, function(m3u8, url) {
                    filename = filename + ".ts";
                    
                    var lines = m3u8.split('\n');
                    var tsLinks = []
                    
                    for (var i = 0; i < lines.length; i++){
                        var line = lines[i];
                        if (line.endsWith(".ts")) {
                            tsLinks.push(baseLink + line)
                        }
                    }
                    
                    var downloadedFiles = 0
                    for (var i = 0; i < tsLinks.length; i++){
                        var tsLink = tsLinks[i];
                        
                        
                        getTSInUrl(tsLink, function(c, url, i) {
                            downloadedFiles = downloadedFiles + 1
                            console.log("got of (" + i + ")" + url + " - " + tsLinks.length + " , " + downloadedFiles)
                            
                            tsLinks[i] = c;
                            
                            if (downloadedFiles == tsLinks.length) {
                                console.log("downloading")
                                
                                var blob = new Blob(tsLinks, {type: 'video/mp4'});
                                var url = URL.createObjectURL(blob);
                                download(url, filename);
                            }
                        }, i)
                    }
                });

            }
            else if (link.indexOf('.mp3') >= 0) { // is audio file
                filename = filename + ".mp3";
                download(link, filename);
            }
        }
    }
}

function getRTPPaginationType(doc) {

    var mainElems = doc.getElementsByClassName("bg-dark-gray");
    
    for (var i = 0 ; i < mainElems.length ; i++) {
        
        var mainPaginationContainers = mainElems[i].getElementsByClassName("container");
        
        for (var j = 0 ; j < mainPaginationContainers.length ; j++) {

            var mainPaginations = mainPaginationContainers[j].getElementsByClassName("pagination");

            for (var l = 0 ; l < mainPaginations.length ; l++) {

                var itemElem = mainPaginations[l].getElementsByTagName("li");

                for (var m = 0 ; m < itemElem.length ; m++) {

                    var items = itemElem[m].getElementsByTagName("a");

                    for (var n = 0 ; n < items.length ; n++) {

                        if (items[n].getAttribute("href") !== undefined) {
                            return 1;
                        }
                    }
                }
            }
        }
    }
    
    // version 2         
    var mainPaginationContainers = doc.getElementsByClassName("section-parts");

    for (var j = 0 ; j < mainPaginationContainers.length ; j++) {

        var mainPaginations = mainPaginationContainers[j].getElementsByClassName("parts");

        for (var l = 0 ; l < mainPaginations.length ; l++) {

            var itemElem = mainPaginations[l].getElementsByTagName("li");

            for (var m = 0 ; m < itemElem.length ; m++) {

                var items = itemElem[m].getElementsByTagName("a");

                for (var n = 0 ; n < items.length ; n++) {

                    if (items[n].getAttribute("href") !== undefined) {
                        return 2;
                    }
                }
            }
        }
    }
    
    return 0;
}

function getRTPPlayPaginationLinksV1(doc) {
    
    var rtpPlayLinks = [];

    var mainElems = doc.getElementsByClassName("bg-dark-gray");
    
    for (var i = 0 ; i < mainElems.length ; i++) {
        
        var mainPaginationContainers = mainElems[i].getElementsByClassName("container");
        
        for (var j = 0 ; j < mainPaginationContainers.length ; j++) {

            var mainPaginations = mainPaginationContainers[j].getElementsByClassName("pagination");

            for (var l = 0 ; l < mainPaginations.length ; l++) {

                var itemElem = mainPaginations[l].getElementsByTagName("li");

                for (var m = 0 ; m < itemElem.length ; m++) {

                    var items = itemElem[m].getElementsByTagName("a");

                    for (var n = 0 ; n < items.length ; n++) {

                        if (items[n].getAttribute("href") !== undefined) {
                            
                            rtpPlayLinks.push({
                                link: window.location.origin + items[n].getAttribute("href"),
                                part: "P" + items[n].innerHTML.replaceAll('Parte',' ').replace(/\s/g, '')
                            });
                        }
                    }
                }
            }
        }
    }
    
    return rtpPlayLinks;
}

function getRTPPlayPaginationLinksV2(doc, url) {
    
    if (url === undefined) {
        url = window.location.href
    }
    
    var rtpPlayLinks = [];
    
    var mainPaginationContainers = doc.getElementsByClassName("section-parts");

    for (var j = 0 ; j < mainPaginationContainers.length ; j++) {

        var mainPaginations = mainPaginationContainers[j].getElementsByClassName("parts");

        for (var l = 0 ; l < mainPaginations.length ; l++) {

            var itemElem = mainPaginations[l].getElementsByTagName("li");
            
            for (var m = 0 ; m < itemElem.length ; m++) {

                var items = itemElem[m].getElementsByTagName("a");
                
                if (items.length === 0) {

                    var spans = itemElem[m].getElementsByTagName("span");
                    
                    for (var n = 0 ; n < spans.length ; n++) {
                        console.log("url = " + url);
                        rtpPlayLinks.push({
                            link: url,
                            part: "P" + spans[n].innerHTML.replaceAll('Parte',' ').replaceAll('PARTE',' ').replace(/\s/g, '')
                        });
                    }
                }
                else {

                    for (var n = 0 ; n < items.length ; n++) {

                        if (items[n].getAttribute("href") !== undefined) {
                            console.log("url n = " + window.location.origin + items[n].getAttribute("href"));
                            rtpPlayLinks.push({
                                link: window.location.origin + items[n].getAttribute("href"),
                                part: "P" + items[n].innerHTML.replaceAll('Parte',' ').replaceAll('PARTE',' ').replace(/\s/g, '')
                            });
                        }
                    }
                }
            }
        }
    }
    
    return rtpPlayLinks;
}

function getRTPPlayFileLinks(doc) {
    
    var rtpPlayLinks = [];
    
    if (isValid(doc) && getDataType() === 'RTPPlay') {
        
        var scriptTags = doc.getElementsByTagName('script');
        
        if (scriptTags === undefined) {
            return false;
        }
        
        for (var i = 0 ; i < scriptTags.length ; i++) {
            
            var link = getRTPPlayLinkFromScriptV2(scriptTags[i].text);
    
            if (link !== undefined) {
                rtpPlayLinks.push(link);
            }
        }
        
    }
    
    return rtpPlayLinks;
}

function downloadEntireRTPPlayFromDocument(doc, url) {
    
    var paginationType = getRTPPaginationType(doc);

    if (paginationType === 0) {
        downloadRTPPlayFromDocument(doc, getTabTitle(doc));
        return
    }

    var rtpPlayPaginationLinks

    if (paginationType === 1) {
        rtpPlayPaginationLinks = getRTPPlayPaginationLinksV1(doc);
    }
    else if (paginationType === 2) {
        rtpPlayPaginationLinks = getRTPPlayPaginationLinksV2(doc, url);
    }
    else {
        alert('Could not find RTP Pagination files');
        return
    }

    if (rtpPlayPaginationLinks.length === 0) {
        alert('No Pagination files found');
        return
    }

    for (var i = 0 ; i < rtpPlayPaginationLinks.length ; i++) {

        getDocumentInUrl(rtpPlayPaginationLinks[i].link, function(doc, url, part) {

            downloadRTPPlayFromDocument(doc, getTabTitle(doc) + "." + part);
            
        }, rtpPlayPaginationLinks[i].part);
    }
}

/***********************/
/******    SIC    ******/
/***********************/

function downloadSICFromDocument(doc, filename) {
    
    var sicFileLinks = getSICFileLinks(doc);

    if (sicFileLinks.length === 0) {
        alert('No SIC file found');
    }
    else {

        for (var i = 0 ; i < sicFileLinks.length ; i++) {

            var link = sicFileLinks[i];
            
            var ext = link.substr(link.lastIndexOf('.'), link.length);
            
            if (ext.indexOf('/net_wide') >= 0) {
                ext = ext.substr(0, ext.indexOf('/net_wide'));
            }
            if (ext.length >= 4) {
                ext = "";
            }

            filename = filename + ext;
            
            if ((filename.length - filename.lastIndexOf('.')) !== 4) {
                // does not have extension
                filename = filename + ".mp4";
            }

            download(link, filename);
        }
    }  
    
}

function getSICFileLinks(doc) {
    
    var sicLinks = [];
    
    if (isValid(doc) && getDataType().indexOf('SIC') >= 0) {
        
        var videoTags = doc.getElementsByTagName('video');
        
        if (videoTags === undefined) {
            return sicLinks;
        }

        for (var i = 0 ; i < videoTags.length ; i++) {

            var link = window.location.protocol + videoTags[i].getAttribute("src");
            
            if (videoTags[i].getAttribute("src") !== undefined) {
                sicLinks.push(link);
            }
        }        
    }
    
    return sicLinks;
}

/***********************/
/***********************/
/***********************/