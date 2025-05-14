/**
 * Lithium-Ion Battery Fire News API
 * This module fetches and displays the latest news about Lithium-Ion Battery Fire incidents
 * using the SerpAPI news search functionality.
 */

// Initialize news API with configuration
function initNewsApi() {
  console.log('Initializing news API...');
  const newsContainer = document.getElementById('news-container');
  
  if (!newsContainer) {
    console.error('News container element not found!');
    return;
  }
  
  console.log('News container found, loading news...');
  displayLoadingState(newsContainer);

  // TEMPORARY: Use sample data until API is working
  useSampleData(newsContainer);
  
  // Uncomment this when API is properly set up
  // fetchBatteryFireNews(newsContainer);
}

/**
 * Uses sample data for development
 */
function useSampleData(container) {
  console.log('Using sample data for development');
  const sampleData = {
    "news_results": [
      {
        "position": 1,
        "link": "https://www.lex18.com/news/lawrenceburg-fire-warns-public-about-lithium-ion-batteries-after-house-fire",
        "title": "Lawrenceburg fire warns public about lithium-ion batteries after house fire",
        "source": "LEX18",
        "date": "2 days ago",
        "snippet": "Lawrenceburg Fire and Rescue provided safety tips on lithium-ion batteries after a house fire on Monday was reportedly caused by an ignited battery.",
        "thumbnail": "https://via.placeholder.com/400x250/151515/11BF4E?text=Battery+Safety"
      },
      {
        "position": 2,
        "link": "https://www.winknews.com/news/lithium-ion-battery-fire-in-the-villas-sparks-solar-panel-safety-concerns",
        "title": "Lithium ion battery fire in the Villas sparks solar panel safety concerns",
        "source": "Wink News",
        "date": "4 hours ago",
        "snippet": "A fire at a battery supply bank in a house in The Villas served as a wake-up call about the potential risks of solar energy systems.",
        "thumbnail": "https://via.placeholder.com/400x250/151515/11BF4E?text=Solar+Safety"
      },
      {
        "position": 3,
        "link": "https://w42st.com/post/fire-555ten-hells-kitchen-lithium-ion-battery",
        "title": "Morning Fire at 555TEN: Lithium-Ion Battery Sparks Blaze in Hell's Kitchen High-Rise",
        "source": "W42ST",
        "date": "2 days ago",
        "snippet": "A 35th-floor battery fire at 555TEN prompted a resident alert, rapid FDNY response and concerns over lithium-ion safety.",
        "thumbnail": "https://via.placeholder.com/400x250/151515/11BF4E?text=High+Rise+Safety"
      }
    ]
  };
  
  // Display the sample data
  setTimeout(() => {
    displayNewsResults(sampleData, container);
  }, 1000); // Fake loading delay
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
 * Fetches battery fire news from SerpAPI via our API route
 * @param {HTMLElement} container - Container to display results
 */
async function fetchBatteryFireNews(container) {
  try {
    // Set up timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    console.log('Fetching news from API endpoint...');
    
    // Make request to our serverless function
    const response = await fetch('/api/news', {
      signal: controller.signal,
      method: 'GET',
      headers: {
        'Accept': 'application/json'
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