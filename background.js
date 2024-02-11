let tabData = {};

function updateTimeSpent(tabId, url) {
    const hostname = (new URL(url)).hostname;
    const cleanedHostname = hostname.replace(/^www\./, '').replace(/\.[^.]+$/, '');
   
    console.log("Updating time spent for tabId:", tabId, "url:", url);

    if (!tabData[tabId]) {
        tabData[tabId] = {
            startTime: new Date(),
            totalTime: {}
        };
    }

    const previousTime = tabData[tabId].startTime; // Get previous start time
    tabData[tabId].startTime = new Date(); // Update start time to current time

    const elapsedTime = tabData[tabId].startTime - previousTime; // Calculate elapsed time
    const elapsedTimeInSeconds = elapsedTime / 1000;

    if (!tabData[tabId].totalTime[cleanedHostname]) {
        tabData[tabId].totalTime[cleanedHostname] = 0; // Initialize time for this URL if not present
    }

    
    tabData[tabId].totalTime[cleanedHostname] += elapsedTimeInSeconds;

    console.log("Updated tabData:", tabData);
}


chrome.tabs.onActivated.addListener(function(activeInfo) {
    chrome.tabs.get(activeInfo.tabId, function(tab) {
        updateTimeSpent(activeInfo.tabId, tab.url);
    });
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.url && tab.active) {
        updateTimeSpent(tabId, changeInfo.url);
    }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request === "getData") {
        console.log("Sending tabData to popup:", tabData);
        sendResponse(tabData);
    }
});
