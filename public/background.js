/**
 * Background Service Worker
 * Handles side panel opening and Chrome extension lifecycle
 */

chrome.runtime.onInstalled.addListener(() => {
  console.log('Course Hierarchy Comparison extension installed');
});

// Open side panel when extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ windowId: tab.windowId });
});

// Set side panel options
chrome.runtime.onStartup.addListener(() => {
  chrome.sidePanel.setOptions({
    path: 'sidepanel.html',
    enabled: true
  });
});

