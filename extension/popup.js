document.getElementById('dispatch-btn').addEventListener('click', () => {
  const input = document.getElementById('intent-input').value;
  if (!input.trim()) return;

  // Encodes the text safely for a URL
  const encodedIntent = encodeURIComponent(input);
  
  // Routes to your local React app with the data attached as a query parameter
  const agentZeroUrl = `http://localhost:3000/?intent=${encodedIntent}`;
  
  // Opens the tab automatically
  chrome.tabs.create({ url: agentZeroUrl });
});