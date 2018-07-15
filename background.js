var activeTabID;
var activeWindowID;

chrome.runtime.onInstalled.addListener(function() {

    chrome.browserAction.disable(null, function() { 
        chrome.tabs.executeScript(null, {file: "isValid.js"});
    });
});

chrome.management.onEnabled.addListener(function(info) {
    //console.log(JSON.stringify(info));

    chrome.browserAction.disable(null, function() { 
        chrome.tabs.executeScript(null, {file: "isValid.js"});
    });
});
    
chrome.browserAction.onClicked.addListener(function(tab) { 
    chrome.tabs.executeScript(tab.id, {file: "fetchLinks.js"});
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.MessageType === 'isValid') {
        if (sender.tab.id === activeTabID) {
            if (request.isValid === true) {
                chrome.browserAction.enable(activeTabID, function() {  });
            }
            else {
                chrome.browserAction.disable(activeTabID, function() { });
            }
        }
    }
    else {
        chrome.downloads.download({url: request.linkSubString},function(id) {
            //console.log('post-download');
        });
    }
});

chrome.tabs.query({active: true, lastFocusedWindow: true}, function(tabs) {
    if (tabs[0].active) {
        activeTabID = tabs[0].id;
    }
    
    chrome.tabs.onCreated.addListener(function(tab) {
        
        if (tab.id === activeTabID) {
            chrome.browserAction.disable(activeTabID, function() { 
                chrome.tabs.executeScript(activeTabID, {file: "isValid.js"});
            });
        }
    });
    chrome.tabs.onActivated.addListener(function(activeInfo) {
        
        chrome.tabs.get(activeInfo.tabId, function(tab) { 
            if (tab.active) {
                activeTabID = tab.id;

                chrome.browserAction.disable(activeTabID, function() { 
                    chrome.tabs.executeScript(activeTabID, {file: "isValid.js"});
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
                chrome.tabs.executeScript(tabId, {file: "isValid.js"});
            }
            else if (info.status === 'loading') {
                chrome.tabs.executeScript(tabId, {file: "isValid.js"});
            }
        }
    });
    
});
