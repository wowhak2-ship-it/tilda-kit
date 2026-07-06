// Toolbar icon opens the panel as a full tab (works without any local server).
chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
});
