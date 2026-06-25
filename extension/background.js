// extension/background.js

// Create the right-click menu
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "send-to-agent-zero",
    title: "Send to Agent Zero Matrix",
    contexts: ["selection"] // Only shows up when text is highlighted
  });
});

// Listen for the click
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "send-to-agent-zero" && info.selectionText) {
    // We encode the highlighted text and open your localhost app with it in the URL
    const encodedIntent = encodeURIComponent(info.selectionText);
    const agentZeroUrl = `http://localhost:3000/?intent=${encodedIntent}`;
    
    // Open a new tab seamlessly 
    chrome.tabs.create({ url: agentZeroUrl });
  }
});