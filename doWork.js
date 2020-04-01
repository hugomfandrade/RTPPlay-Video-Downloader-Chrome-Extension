
var currentDownloaded = 0
var currentTotal = 0
var isDownloading = false

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    
    if (request.MessageType === 'parsing') {
    
        // chrome.tabs.executeScript(null, {
        //     code: 'var debugmessage = ' + '"onMessage = ' + request.MessageType + ' , ' + request.IsNeeded + '"' + ';'
        // }, function() {chrome.tabs.executeScript(null, {file: 'debugMessage.js'});});
        if (request.IsNeeded === true) {
            
        }
        else {
            isDownloading = false
            window.close()
        }
    }
    
    else if (request.MessageType === 'parsing-progress') {
        
        chrome.tabs.executeScript(null, {
            code: 'var debugmessage = ' + '"onMessage = ' + request.MessageType + ' , ' + request.Downloaded + ' , ' + request.Total + '"' + ';'
        }, function() {chrome.tabs.executeScript(null, {file: 'debugMessage.js'});});
        
        var downloaded = request.Downloaded
        var total = request.Total
        var progress = downloaded * 100 / total
    
        currentDownloaded = downloaded
        currentTotal = total
        
        document.getElementById('progress').value = progress;
        
        
        if (downloaded === total) {
            isDownloading = false
            window.close()
        }
        else {
            document.getElementById('progress').value = progress;
        }
    }
});

chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var tab = tabs[0];
    currentTab = tab; // used in later calls to get tab info
    
    if (isDownloading === true) {
        var downloaded = currentDownloaded
        var total = currentTotal
        
        if (total > 0) {
            var progress = downloaded * 100 / total

            document.getElementById('progress').value = progress;
        }
        
        return
    }
    
    isDownloading = true
    
    chrome.tabs.executeScript(tab.id, {file: "backgroundDatatype.js"});
    chrome.tabs.executeScript(tab.id, {file: "fetchLinksLib.js"});
    chrome.tabs.executeScript(tab.id, {file: "fetchLinks.js"});
});