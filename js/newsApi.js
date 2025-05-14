// SerpAPI News integration for lithium-ion battery fire news
document.addEventListener("DOMContentLoaded", function() {
    // Configuration
    const apiKey = "8780a99876523838de6e2ce98fbd3acbd884e8576955ad86085c4d0da76f25c8";
    const searchTerm = "lithium-ion battery fire";
    const numberOfArticles = 6; // Default number to show on the homepage
    
    // DOM Elements
    const newsContainer = document.getElementById("news-container");
    
    // Fetch news articles
    async function fetchNews() {
        try {
            const response = await fetch(`https://serpapi.com/search.json?q=${encodeURIComponent(searchTerm)}&tbm=nws&api_key=${apiKey}`);
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            const data = await response.json();
            
            // Check if we have news results
            if (data.news_results && data.news_results.length > 0) {
                displayNews(data.news_results.slice(0, numberOfArticles));
            } else {
                displayError("No news articles found.");
            }
        } catch (error) {
            console.error("Error fetching news:", error);
            displayError("Failed to load news. Please try again later.");
        }
    }
    
    // Display news in the container
    function displayNews(articles) {
        // Clear loading placeholder
        newsContainer.innerHTML = "";
        
        // Create HTML for each article
        articles.forEach(article => {
            const articleCard = document.createElement("div");
            articleCard.className = "product-card bg-dark rounded-xl overflow-hidden";
            
            // Prepare thumbnail image with fallback
            const thumbnailUrl = article.thumbnail ? article.thumbnail : "https://via.placeholder.com/300x200/151515/11BF4E?text=Lithium+Ion+Battery";
            
            // Format date
            const publishedDate = article.date ? new Date(article.date).toLocaleDateString() : "Recent";
            
            articleCard.innerHTML = `
                <div class="relative h-48">
                    <img src="${thumbnailUrl}" alt="${article.title}" class="w-full h-full object-cover">
                    <div class="absolute inset-0 bg-gradient-to-t from-darker/90 via-transparent to-transparent"></div>
                    <div class="absolute bottom-0 left-0 p-4">
                        <span class="bg-primary text-white text-xs px-3 py-1 rounded-full">News</span>
                    </div>
                </div>
                <div class="p-6">
                    <h3 class="text-xl font-bold mb-3 hover:text-primary transition">${article.title}</h3>
                    <p class="text-slate-400 text-sm mb-4">${article.snippet || "Read the full article for more details."}</p>
                    <div class="flex items-center justify-between">
                        <span class="text-xs text-slate-500">${publishedDate}</span>
                        <a href="${article.link}" target="_blank" class="text-primary inline-flex items-center text-sm hover:text-white transition">
                            Read More <i class="fas fa-arrow-right ml-2"></i>
                        </a>
                    </div>
                </div>
            `;
            
            newsContainer.appendChild(articleCard);
        });
        
        // Make "View All Articles" button functional
        const viewAllButton = document.querySelector("#news .text-center a");
        if (viewAllButton) {
            viewAllButton.href = `https://serpapi.com/search.html?q=${encodeURIComponent(searchTerm)}&tbm=nws`;
        }
    }
    
    // Display error message
    function displayError(message) {
        newsContainer.innerHTML = `
            <div class="col-span-3 text-center py-8">
                <i class="fas fa-exclamation-circle text-primary text-2xl mb-4"></i>
                <p class="text-slate-300">${message}</p>
            </div>
        `;
    }
    
    // Initialize news fetch
    fetchNews();
});