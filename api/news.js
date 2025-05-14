export default async function handler(req, res) {
  try {
    // Use the correct API key that you provided
    const apiKey = '8780a99876523838de6e2ce98fbd3acbd884e8576955ad86085c4d0da76f25c8';
    const query = 'Lithium-Ion Battery Fire';
    const url = `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&tbm=nws&api_key=${apiKey}`;
    
    console.log('Making SerpAPI request with key:', apiKey);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('SerpAPI returned status:', response.status);
      return res.status(response.status).json({ 
        error: 'API request failed', 
        status: response.status
      });
    }
    
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Failed to fetch news' });
  }
}