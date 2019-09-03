var activeTabID;
var activeWindowID;

chrome.contextMenus.removeAll();
/*chrome.contextMenus.create({
    id: "download_context_menu_item",
    title: "Download",
    contexts: ["browser_action"]
});*/
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
    
        /*chrome.tabs.executeScript(null, {
            code: 'var debugmessage = ' + '"onMessage = ' + request.isValid + ' , ' + request.isEpisodeValid + '"' + ';'
        }, function() {chrome.tabs.executeScript(null, {file: 'debugMessage.js'});});*/

        if (sender.tab.id === activeTabID) {
            
            if (request.isValid === true) {
                chrome.browserAction.enable(activeTabID, function() {  });
            }
            else {
                chrome.browserAction.disable(activeTabID, function() { });
            }
            
            chrome.contextMenus.update("download_context_menu_item", {enabled: request.isValid});
            chrome.contextMenus.update("download_all_context_menu_item", {enabled: request.isEpisodeValid});
            
            setBrowserActionIcon(request.type, request.isValid, request.isEpisodeValid)
        }
    }
    else if (request.MessageType === 'download') {
        chrome.downloads.download({url: request.link, filename: request.filename},function(id) {});
    }
});

function setBrowserActionIcon(type, isItemValid, isPaginationValid) {
    var title = "rtpplay_downloader"
    
    if (type === undefined || type === "RTPPlay") {
        title = "rtpplay_downloader"
    }
    else if (type === "SICRadical") {
        title = "sicradical_downloader"
    }
    else if (type === "SICNoticias") {
        title = "sicnoticias_downloader"
    }
    else if (type === "SIC") {
        title = "sic_downloader"
    }
    else {
        title = "rtpplay_downloader"
    }
    
    if (isItemValid === false && isPaginationValid === false) {
        title = title + "_disabled"
    }
    
    chrome.browserAction.setIcon({path: {
        "16": "images/" + title + "_16.png",
        "32": "images/" + title + "_32.png",
        "48": "images/" + title + "_48.png",
        "128": "images/" + title + "_128.png"
    }});
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
