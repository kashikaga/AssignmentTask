// Change this:
const API_BASE_URL = 'https://api.appify.com/v1';


const response = await fetch(`${API_BASE_URL}/actors`, {
  headers: { 'Authorization': `Bearer ${apiKey}` }
});