/**
 * NewsList component - Fetches and displays news articles about Lithium-Ion Battery Fire
 * using the SerpAPI News API.
 */
export default function NewsList({ query = 'Lithium-Ion Battery Fire' }) {
  const container = document.createElement('div');
  container.className = 'grid md:grid-cols-3 gap-8';
  
  // Show loading state
  const loadingEl = document.createElement('div');
  loadingEl.className = 'col-span-3 text-center py-8';
  loadingEl.innerHTML = '<i class="fas fa-spinner fa-spin text-primary text-2xl mr-2"></i> Loading latest industry news...';
  container.appendChild(loadingEl);
  
  // Fetch news articles
  fetchNews(query)
    .then(newsItems => {
      // Remove loading element
      container.removeChild(loadingEl);
      
      // Display news items or show error message
      if (newsItems && newsItems.length > 0) {
        newsItems.forEach(item => {
          container.appendChild(createNewsCard(item));
        });
      } else {
        const errorEl = document.createElement('div');
        errorEl.className = 'col-span-3 text-center py-8 text-slate-400';
        errorEl.textContent = 'No news articles found. Please try again later.';
        container.appendChild(errorEl);
      }
    })
    .catch(error => {
      console.error('Error fetching news:', error);
      container.removeChild(loadingEl);
      
      const errorEl = document.createElement('div');
      errorEl.className = 'col-span-3 text-center py-8 text-slate-400';
      errorEl.textContent = 'Failed to load news articles. Please try again later.';
      container.appendChild(errorEl);
    });
  
  return container;
}

/**
 * Fetches news articles from SerpAPI
 */
async function fetchNews(query) {
  const apiKey = '299d65578a5261c22a1ee82142b171057004cd8a2ea0b37ba6e02e155d3957a1';
  const encodedQuery = encodeURIComponent(query);
  const url = `https://serpapi.com/search.json?q=${encodedQuery}&tbm=nws&api_key=${apiKey}`;
  
  try {
    // For security reasons in production, you should proxy this request through your backend
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    // Return only the first 3 news items
    return data.news_results ? data.news_results.slice(0, 3) : [];
  } catch (error) {
    console.error('Error fetching news from API:', error);
    throw error;
  }
}

/**
 * Creates a news card element
 */
function createNewsCard(newsItem) {
  const card = document.createElement('div');
  card.className = 'bg-dark rounded-xl overflow-hidden shadow-lg hover:scale-105 transition duration-500 border border-slate-800';
  
  // Format the date
  let dateStr = 'Recent';
  if (newsItem.date) {
    const date = new Date(newsItem.date);
    if (!isNaN(date)) {
      dateStr = date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  }
  
  // Create image placeholder if no image is provided
  const imageUrl = newsItem.thumbnail || 'https://via.placeholder.com/400x200/151515/11BF4E?text=Elven+Technologies';
  
  // Get source name or use a default
  const source = newsItem.source || 'News Source';
  
  card.innerHTML = `
    <div class="h-48 overflow-hidden">
      <img src="${imageUrl}" alt="${newsItem.title}" class="w-full h-full object-cover">
    </div>
    <div class="p-6">
      <div class="flex items-center mb-2">
        <span class="bg-primary/10 text-primary text-xs px-3 py-1 rounded-full">${source}</span>
        <span class="text-slate-500 text-xs ml-2">${dateStr}</span>
      </div>
      <h3 class="text-xl font-bold mb-3 line-clamp-2">${newsItem.title}</h3>
      <p class="text-slate-400 mb-4 text-sm line-clamp-3">${newsItem.snippet || 'Click to read more about this article.'}</p>
      <a href="${newsItem.link}" target="_blank" class="text-primary inline-flex items-center text-sm font-medium">
        Read Article <i class="fas fa-arrow-right ml-2"></i>
      </a>
    </div>
  `;
  
  return card;
}