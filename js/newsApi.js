/**
 * Lithium-Ion Battery Fire News API
 * This module fetches and displays the latest news about Lithium-Ion Battery Fire incidents
 * using the SerpAPI news search functionality.
 */

// Initialize news API with configuration
function initNewsApi() {
  console.log('Initializing news API...');
  const apiKey = process.env.SERPAPI_KEY || '299d65578a5261c22a1ee82142b171057004cd8a2ea0b37ba6e02e155d3957a1';
  const query = 'Lithium-Ion Battery Fire';
  const newsContainer = document.getElementById('news-container');
  
  if (!newsContainer) {
    console.error('News container element not found!');
    return;
  }
  
  console.log('News container found, loading news...');
  displayLoadingState(newsContainer);
  
  // Fetch news articles
  fetchBatteryFireNews(apiKey, query, newsContainer);
}

/**
 * Displays loading state in the news container
 * @param {HTMLElement} container - The container element
 */
function displayLoadingState(container) {
  container.innerHTML = `
    <div class="col-span-3 text-center py-8">
      <i class="fas fa-spinner fa-spin text-primary text-2xl mr-2"></i> Loading latest industry news...
    </div>
  `;
}

/**
 * Fetches battery fire news from SerpAPI
 * @param {string} apiKey - Your SerpAPI key
 * @param {string} query - Search query
 * @param {HTMLElement} container - Container to display results
 */
async function fetchBatteryFireNews(apiKey, query, container) {
  try {
    // Build the API URL with parameters
    const serpApiUrl = `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&tbm=nws&api_key=${apiKey}`;
    
    // Use a CORS proxy to bypass CORS restrictions
    const corsProxyUrl = 'https://cors-anywhere.herokuapp.com/';
    const url = corsProxyUrl + serpApiUrl;
    
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // Increased timeout
    
    try {
      // Fetch data through the CORS proxy
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Origin': window.location.origin
        }
      });
      
      // Clear timeout since request is complete
      clearTimeout(timeoutId);
      
      // Check if request was successful
      if (!response.ok) {
        console.error('API returned error status:', response.status);
        throw new Error(`API request failed with status: ${response.status}`);
      }
      
      // Parse JSON response
      const data = await response.json();
      console.log('API response data:', data); // Log the response for debugging
      
      // Display the news results
      displayNewsResults(data, container);
    } catch (fetchError) {
      console.error('Fetch error details:', fetchError);
      throw fetchError;
    }
  } catch (error) {
    console.error('Error fetching battery fire news:', error);
    
    let errorMessage = 'Error loading news articles. Please try again later.';
    if (error.name === 'AbortError') {
      errorMessage = 'Request timed out. Please check your internet connection and try again.';
    } else if (error.message.includes('NetworkError')) {
      errorMessage = 'Network error. Please check your internet connection.';
    } else if (error.message.includes('API key')) {
      errorMessage = 'API authentication error. Please contact support.';
    }
    
    displayErrorMessage(container, errorMessage);
  }
}

/**
 * Displays news results in the container
 * @param {Object} data - API response data
 * @param {HTMLElement} container - Container element
 */
function displayNewsResults(data, container) {
  // Clear the container
  container.innerHTML = '';
  
  // Check if we have news results
  if (data.news_results && data.news_results.length > 0) {
    // Display up to 3 news articles
    const newsItems = data.news_results.slice(0, 3);
    
    // Create cards for each news item
    newsItems.forEach(news => {
      container.appendChild(createNewsCard(news));
    });
  } else {
    displayErrorMessage(container, 'No news articles found about Lithium-Ion Battery Fire.');
  }
}

/**
 * Creates a news card element
 * @param {Object} news - News item data
 * @returns {HTMLElement} - News card element
 */
function createNewsCard(news) {
  const card = document.createElement('div');
  card.className = 'bg-dark rounded-xl overflow-hidden shadow-lg hover:scale-105 transition duration-500 border border-slate-800';
  
  // Format date if available
  let dateStr = 'Recent';
  if (news.date) {
    const newsDate = new Date(news.date);
    if (!isNaN(newsDate)) {
      dateStr = newsDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  }
  
  // Default image if none is provided
  const imageUrl = news.thumbnail || 'https://via.placeholder.com/400x250/151515/11BF4E?text=Battery+Safety';
  
  // Source name
  const source = news.source || 'News Source';
  
  // Build the HTML content
  card.innerHTML = `
    <div class="h-48 overflow-hidden">
      <img src="${imageUrl}" alt="${news.title}" class="w-full h-full object-cover">
    </div>
    <div class="p-6">
      <div class="flex items-center mb-2">
        <span class="bg-primary/10 text-primary text-xs px-3 py-1 rounded-full">${source}</span>
        <span class="text-slate-500 text-xs ml-2">${dateStr}</span>
      </div>
      <h3 class="text-xl font-bold mb-3">${news.title}</h3>
      <p class="text-slate-400 mb-4 text-sm">${news.snippet || 'Click to read the full article.'}</p>
      <a href="${news.link}" target="_blank" class="text-primary inline-flex items-center text-sm font-medium">
        Read Article <i class="fas fa-arrow-right ml-2"></i>
      </a>
    </div>
  `;
  
  return card;
}

/**
 * Displays error message in the container
 * @param {HTMLElement} container - Container element
 * @param {string} message - Error message to display
 */
function displayErrorMessage(container, message) {
  container.innerHTML = `
    <div class="col-span-3 text-center py-8">
      <div class="text-slate-400">${message}</div>
      <button class="mt-4 px-6 py-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition" onclick="location.reload()">
        Retry
      </button>
    </div>
  `;
}

// Initialize news API when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initNewsApi);