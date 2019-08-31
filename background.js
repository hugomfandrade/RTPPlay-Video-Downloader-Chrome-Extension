var activeTabID;
var activeWindowID;

chrome.contextMenus.removeAll();
chrome.contextMenus.create({
    id: "download_context_menu_item",
    title: "Download",
    contexts: ["browser_action"]
});
chrome.contextMenus.create({
    id: "download_all_context_menu_item",
    title: "Download all",
    contexts: ["browser_action"]
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
    if (info.menuItemId === "download_all_context_menu_item") {
        chrome.tabs.executeScript(tab.id, {file: "backgroundDatatype.js"});
        chrome.tabs.executeScript(tab.id, {file: "fetchLinksLib.js"});
        chrome.tabs.executeScript(tab.id, {file: "fetchAllLinks.js"});
    }
    else if (info.menuItemId === "download_context_menu_item") {
        chrome.tabs.executeScript(tab.id, {file: "backgroundDatatype.js"});
        chrome.tabs.executeScript(tab.id, {file: "fetchLinksLib.js"});
        chrome.tabs.executeScript(tab.id, {file: "fetchLinks.js"});
    }
});
    
chrome.browserAction.onClicked.addListener(function(tab) { 
    chrome.tabs.executeScript(tab.id, {file: "backgroundDatatype.js"});
    chrome.tabs.executeScript(tab.id, {file: "fetchLinksLib.js"});
    chrome.tabs.executeScript(tab.id, {file: "fetchLinks.js"});
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    
    if (request.MessageType === 'isValid') {
    
        chrome.tabs.executeScript(null, {
            code: 'var debugmessage = ' + '"onMessage = ' + request.isValid + ' , ' + request.isEpisodeValid + '"' + ';'
        }, function() {chrome.tabs.executeScript(null, {file: 'debugMessage.js'});});

        if (sender.tab.id === activeTabID) {
            
            if (request.isValid === true) {
                chrome.browserAction.enable(activeTabID, function() {  });
            }
            else {
                chrome.browserAction.disable(activeTabID, function() { });
            }
            
            chrome.contextMenus.update("download_context_menu_item", {enabled: request.isValid});
            chrome.contextMenus.update("download_all_context_menu_item", {enabled: request.isEpisodeValid});
            
            setBrowserActionIcon(request.type)
        }
    }
    else if (request.MessageType === 'download') {
        chrome.downloads.download({url: request.link, filename: request.filename},function(id) {});
    }
});

function setBrowserActionIcon(type) {
    if (type === undefined || type === "RTPPlay") {
        chrome.browserAction.setIcon({path: {
            "16": "images/rtpplay_downloader_16.png",
            "32": "images/rtpplay_downloader_32.png",
            "48": "images/rtpplay_downloader_48.png",
            "128": "images/rtpplay_downloader_128.png"
        }});
    }
    else if (type === "SICRadical") {
        chrome.browserAction.setIcon({path: {
            "16": "images/sicradical_downloader_16.png",
            "32": "images/sicradical_downloader_32.png",
            "48": "images/sicradical_downloader_48.png",
            "128": "images/sicradical_downloader_128.png"
        }});
    }
    else if (type === "SICNoticias") {
        chrome.browserAction.setIcon({path: {
            "16": "images/sicnoticias_downloader_16.png",
            "32": "images/sicnoticias_downloader_32.png",
            "48": "images/sicnoticias_downloader_48.png",
            "128": "images/sicnoticias_downloader_128.png"
        }});
    }
    else if (type === "SIC") {
        chrome.browserAction.setIcon({path: {
            "16": "images/sic_downloader_16.png",
            "32": "images/sic_downloader_32.png",
            "48": "images/sic_downloader_48.png",
            "128": "images/sic_downloader_128.png"
        }});
    }
    else {
        chrome.browserAction.setIcon({path: {
            "16": "images/rtpplay_downloader_16.png",
            "32": "images/rtpplay_downloader_32.png",
            "48": "images/rtpplay_downloader_48.png",
            "128": "images/rtpplay_downloader_128.png"
        }});
    }
}

chrome.runtime.onInstalled.addListener(function() {
    
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [new chrome.declarativeContent.PageStateMatcher({
                pageUrl: {hostEquals: 'developer.chrome.com'},
            })],
            actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
    });

    chrome.browserAction.disable(null, function() { 
        chrome.tabs.executeScript(null, {file: "backgroundDatatype.js"});
        chrome.tabs.executeScript(null, {file: "isValid.js"});
    });
    chrome.contextMenus.update("disable_context_menu_item", {enabled: false}, function() {
        chrome.tabs.executeScript(null, {file: "backgroundDatatype.js"});
        chrome.tabs.executeScript(null, {file: "isValid.js"});
    });
});

chrome.management.onEnabled.addListener(function(info) {
    //console.log(JSON.stringify(info));

    chrome.browserAction.disable(null, function() { 
        chrome.tabs.executeScript(null, {file: "backgroundDatatype.js"});
        chrome.tabs.executeScript(null, {file: "isValid.js"});
    });
    chrome.contextMenus.update("disable_context_menu_item", {enabled: false}, function() {
        chrome.tabs.executeScript(null, {file: "backgroundDatatype.js"});
        chrome.tabs.executeScript(null, {file: "isValid.js"});
    });
});

chrome.tabs.query({active: true, lastFocusedWindow: true}, function(tabs) {
    if (tabs[0].active) {
        activeTabID = tabs[0].id;
    }
    
    chrome.tabs.onCreated.addListener(function(tab) {
        
        if (tab.id === activeTabID) {
            chrome.browserAction.disable(activeTabID, function() { 
                chrome.tabs.executeScript(activeTabID, {file: "backgroundDatatype.js"});
                chrome.tabs.executeScript(activeTabID, {file: "isValid.js"});
            });
            chrome.contextMenus.update("disable_context_menu_item", {enabled: false}, function() {
                chrome.tabs.executeScript(null, {file: "backgroundDatatype.js"});
                chrome.tabs.executeScript(null, {file: "isValid.js"});
            });
        }
    });
    chrome.tabs.onActivated.addListener(function(activeInfo) {
        //chrome.tabs.executeScript(null, {file: "debug.js"});
        
        chrome.tabs.get(activeInfo.tabId, function(tab) { 
            if (tab.active) {
                activeTabID = tab.id;

                chrome.browserAction.disable(activeTabID, function() { 
                    chrome.tabs.executeScript(activeTabID, {file: "backgroundDatatype.js"});
                    chrome.tabs.executeScript(activeTabID, {file: "isValid.js"});
                });
                chrome.contextMenus.update("disable_context_menu_item", {enabled: false}, function() {
                    chrome.tabs.executeScript(null, {file: "backgroundDatatype.js"});
                    chrome.tabs.executeScript(null, {file: "isValid.js"});
                });
            }
        });
    });

    chrome.tabs.onUpdated.addListener(function (tabId, info, tab) {
        if (tab.active) {
            activeTabID = tab.id;
        }
        if (tabId === activeTabID) {
            if (info.status === 'complete') {
                chrome.tabs.executeScript(tabId, {file: "backgroundDatatype.js"});
                chrome.tabs.executeScript(tabId, {file: "isValid.js"});
            }
            else if (info.status === 'loading') {
                chrome.tabs.executeScript(tabId, {file: "backgroundDatatype.js"});
                chrome.tabs.executeScript(tabId, {file: "isValid.js"});
            }
        }
    });
    
});
