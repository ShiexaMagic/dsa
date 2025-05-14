export default async function handler(req, res) {
  try {
    const apiKey = process.env.SERPAPI_KEY || '299d65578a5261c22a1ee82142b171057004cd8a2ea0b37ba6e02e155d3957a1';
    const query = 'Lithium-Ion Battery Fire';
    const url = `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&tbm=nws&api_key=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    res.status(200).json(data);
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
}