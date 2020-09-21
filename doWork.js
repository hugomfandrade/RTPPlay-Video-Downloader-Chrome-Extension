
var currentDownloaded = 0
var currentTotal = 0
var isDownloading = false

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    

    if (request.MessageType === 'parsing') {

        // debug(request.MessageType + ' , ' + request.IsNeeded)

        if (request.IsNeeded === true) {
            
        }
        else {
            isDownloading = false
            window.close()
        }
    }
    
    else if (request.MessageType === 'parsing-progress') {
        
        // debug(request.MessageType + ' , ' + request.Downloaded + ' , ' + request.Total);
        
        var downloaded = request.Downloaded
        var total = request.Total
        var progress = downloaded * 100 / total
    
        currentDownloaded = downloaded
        currentTotal = total
        
        document.getElementById('download-percentage').innerHTML  = progress.toFixed(0) + '%';
        document.getElementById('progress').value = progress;
        
        
        if (downloaded === total) {
            isDownloading = false
            window.close()
        }
        else {
            document.getElementById('download-percentage').innerHTML  = progress.toFixed(0) + '%';
            document.getElementById('progress').value = progress;
        }
    }
});

chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    
    // debug('query = ' + isDownloading)
    debug('query = ' + chrome.extension.getBackgroundPage().dbgIndex);

    var tab = tabs[0];
    currentTab = tab; // used in later calls to get tab info
    
    if (isDownloading === true) {
        var downloaded = currentDownloaded
        var total = currentTotal
        
        if (total > 0) {
            var progress = downloaded * 100 / total

            document.getElementById('download-percentage').innerHTML  = progress.toFixed(0) + '%';
            document.getElementById('progress').value = progress;
        }
        
        return
    }
    
    isDownloading = true
    
    chrome.tabs.executeScript(tab.id, {file: "backgroundDatatype.js"});
    chrome.tabs.executeScript(tab.id, {file: "fetchLinksLib.js"});
    chrome.tabs.executeScript(tab.id, {file: "fetchLinks.js"});
});

function debug(message) {
    
    chrome.tabs.executeScript(null, {
        code: 'var debugmessage = ' + '"onMessage = ' + message + '"' + ';'
   }, function() {chrome.tabs.executeScript(null, {file: 'debugMessage.js'});});
}