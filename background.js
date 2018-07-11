chrome.runtime.onInstalled.addListener(function() {
    
    /*chrome.browserAction.onClicked.addListener(function(tab) { 
        chrome.tabs.executeScript(null, {file: "testScript.js"});
    });/**/
});
    
chrome.browserAction.onClicked.addListener(function(tab) { 
    chrome.tabs.executeScript(null, {file: "testScript.js"});
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
      
      chrome.downloads.download({url: request.linkSubString},function(id) {
          console.log('post-download');
      });
  });
