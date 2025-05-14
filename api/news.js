// Simple serverless function to fetch news from SerpAPI
module.exports = async (req, res) => {
  try {
    // Your API key - consider using environment variables in production
    const apiKey = '8780a99876523838de6e2ce98fbd3acbd884e8576955ad86085c4d0da76f25c8';
    const query = 'Lithium-Ion Battery Fire';
    
    // Build the API URL with parameters
    const url = `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&tbm=nws&api_key=${apiKey}`;
    
    // Make request to SerpAPI
    const fetch = require('node-fetch');
    const response = await fetch(url);
    
    // Check if request was successful
    if (!response.ok) {
      console.error('SerpAPI error:', response.status);
      return res.status(response.status).json({
        error: 'Failed to fetch news from SerpAPI',
        status: response.status
      });
    }
    
    // Return the data
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error in API route:', error);
    return res.status(500).json({
      error: 'Server error',
      message: error.message
    });
  }
};