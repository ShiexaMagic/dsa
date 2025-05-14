// SerpAPI News integration for lithium-ion battery fire news
document.addEventListener("DOMContentLoaded", function() {
    // Configuration
    const apiKey = "8780a99876523838de6e2ce98fbd3acbd884e8576955ad86085c4d0da76f25c8";
    const searchTerm = "lithium-ion battery fire";
    const numberOfArticles = 3; // Default number to show on the homepage
    
    // DOM Elements
    const newsContainer = document.getElementById("news-container");
    
    // Fetch news articles - keeping your working implementation
    async function fetchNews() {
        try {
            // Try direct fetch to SerpAPI (will likely fail due to CORS)
            // This is just to check if the API key works
            const directResponse = await fetch(`https://serpapi.com/search.json?q=${encodeURIComponent(searchTerm)}&tbm=nws&api_key=${apiKey}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            }).catch(() => null); // Catch CORS errors silently
            
            // If direct fetch works (unlikely in browser)
            if (directResponse && directResponse.ok) {
                const data = await directResponse.json();
                if (data.news_results && data.news_results.length > 0) {
                    displayNews(data.news_results.slice(0, numberOfArticles));
                    return;
                }
            }
            
            // Fall back to CORS proxy
            console.log("Direct API call failed, trying CORS proxy...");
            const corsProxyUrl = "https://api.allorigins.win/get?url=";
            const targetUrl = encodeURIComponent(`https://serpapi.com/search.json?q=${encodeURIComponent(searchTerm)}&tbm=nws&api_key=${apiKey}`);
            
            const response = await fetch(corsProxyUrl + targetUrl);
            
            if (!response.ok) {
                throw new Error('Proxy request failed: ' + response.status);
            }
            
            const responseData = await response.json();
            
            // allorigins returns the content in the 'contents' property as a string
            if (responseData && responseData.contents) {
                try {
                    const data = JSON.parse(responseData.contents);
                    
                    if (data.news_results && data.news_results.length > 0) {
                        displayNews(data.news_results.slice(0, numberOfArticles));
                        return;
                    }
                } catch (parseError) {
                    console.error("Error parsing JSON from proxy:", parseError);
                }
            }
            
            // If we get here, neither attempt worked, so use mock data
            console.log("Using mock data as fallback");
            displayMockData();
            
        } catch (error) {
            console.error("Error fetching news:", error);
            // Fall back to mock data if all API approaches fail
            displayMockData();
        }
    }
    
    // Add or update the displayNews function for better image quality
    function displayNews(articles) {
        // Clear loading placeholder
        newsContainer.innerHTML = "";
        
        // High-quality fallback images - using high-resolution Unsplash images
        const fallbackImages = [
            "https://images.unsplash.com/photo-1593941707882-a5bba53b0999?q=90&w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1626438962886-611a9453d22c?q=90&w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1596998791979-1296130c2c3e?q=90&w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1582983508991-59607a419255?q=90&w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?q=90&w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1605969488889-aa843a386abf?q=90&w=1200&auto=format&fit=crop"
        ];
        
        // Create HTML for each article
        articles.forEach((article, index) => {
            const articleCard = document.createElement("div");
            articleCard.className = "product-card bg-dark rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/10";
            
            // Enhanced thumbnail handling for maximum quality
            let thumbnailUrl;
            
            if (article.thumbnail) {
                thumbnailUrl = article.thumbnail;
                
                // Check for different image services and optimize URL for quality
                
                // For Google CDN images
                if (thumbnailUrl.includes('googleusercontent.com')) {
                    thumbnailUrl = thumbnailUrl.replace(/=w\d+-h\d+/, '=w1200-h800').replace(/=s\d+/, '=s1200');
                }
                
                // For WordPress-hosted images
                else if (thumbnailUrl.includes('wp.com') || thumbnailUrl.includes('wordpress.com')) {
                    thumbnailUrl = thumbnailUrl.includes('?') 
                        ? thumbnailUrl + '&w=1200&q=90' 
                        : thumbnailUrl + '?w=1200&q=90';
                }
                
                // For Brightspot/Times sites (like LA Times in the example)
                else if (thumbnailUrl.includes('brightspot')) {
                    // Already good quality
                }
                
                // For generic CDNs - add quality parameters
                else if (thumbnailUrl.includes('cdn.') || thumbnailUrl.includes('.cloudfront.')) {
                    thumbnailUrl = thumbnailUrl.includes('?')
                        ? thumbnailUrl + '&quality=90&width=1200'
                        : thumbnailUrl + '?quality=90&width=1200';
                }
                
                // If URL contains 'resize' but with small dimensions, upgrade it
                else if (thumbnailUrl.match(/resize\/\d+x\d+/)) {
                    thumbnailUrl = thumbnailUrl.replace(/resize\/\d+x\d+/, 'resize/1200x800');
                }
            } else {
                // Use high-quality fallback images
                thumbnailUrl = fallbackImages[index % fallbackImages.length];
            }
            
            // Format date
            const publishedDate = article.date ? new Date(article.date).toLocaleDateString() : "Recent";
            
            articleCard.innerHTML = `
                <div class="relative overflow-hidden h-48 group">
                    <img src="${thumbnailUrl}" alt="${article.title}" 
                         class="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110">
                    <div class="absolute inset-0 bg-gradient-to-t from-darker/90 via-darker/30 to-transparent"></div>
                    <div class="absolute bottom-0 left-0 p-4">
                        <span class="bg-primary text-white text-xs px-3 py-1 rounded-full shadow-md">News</span>
                    </div>
                </div>
                <div class="p-6">
                    <h3 class="text-xl font-bold mb-3 hover:text-primary transition line-clamp-2">${article.title}</h3>
                    <p class="text-slate-400 text-sm mb-4 line-clamp-3">${article.snippet || "Read the full article for more details."}</p>
                    <div class="flex items-center justify-between">
                        <span class="text-xs text-slate-500">${publishedDate}</span>
                        <a href="${article.link}" target="_blank" class="text-primary inline-flex items-center text-sm hover:text-white transition">
                            Read More <i class="fas fa-arrow-right ml-2"></i>
                        </a>
                    </div>
                </div>
            `;
            
            // Enhanced image error handling with priority-based fallbacks
            const imgElement = articleCard.querySelector('img');
            if (imgElement) {
                // Add lazy loading attribute
                imgElement.setAttribute('loading', 'lazy');
                
                // Add fetchpriority for key images
                if (index < 3) {
                    imgElement.setAttribute('fetchpriority', 'high');
                }
                
                // Setup progressive enhancement
                imgElement.style.backgroundColor = '#151515'; // Base color while loading
                
                // Enhanced error handling
                imgElement.onerror = function() {
                    // First try: If SerpAPI thumbnail fails, try thumbnail_small if available
                    if (article.thumbnail_small) {
                        this.src = article.thumbnail_small;
                        
                        // Setup second fallback if that also fails
                        this.onerror = function() {
                            this.src = fallbackImages[index % fallbackImages.length];
                        };
                    } else {
                        // Direct fallback to Unsplash image
                        this.src = fallbackImages[index % fallbackImages.length];
                    }
                };
            }
            
            newsContainer.appendChild(articleCard);
        });
        
        // Make "View All Articles" button functional
        const viewAllButton = document.querySelector("#news .text-center a");
        if (viewAllButton) {
            viewAllButton.href = `https://www.google.com/search?q=${encodeURIComponent(searchTerm)}&tbm=nws`;
        }
    }
    
    // Display mock data for development or when API fails
    function displayMockData() {
        const mockArticles = [
            {
                title: "New Safety Protocols for Lithium-Ion Battery Storage",
                snippet: "Industry experts have released updated guidelines for the safe storage and handling of lithium-ion batteries following recent fire incidents.",
                link: "https://www.example.com/battery-safety",
                date: "2025-05-01",
                thumbnail: "https://images.unsplash.com/photo-1593941707882-a5bba53b0999?q=80&w=800&auto=format&fit=crop"
            },
            {
                title: "Research Breakthrough: Fire-Resistant Battery Materials",
                snippet: "Scientists have developed a new composite material that could significantly reduce the risk of thermal runaway in lithium-ion batteries.",
                link: "https://www.example.com/battery-research",
                date: "2025-04-28",
                thumbnail: "https://images.unsplash.com/photo-1626438962886-611a9453d22c?q=80&w=800&auto=format&fit=crop"
            },
            {
                title: "Electric Vehicle Fire Incidents Down 30% with New Technology",
                snippet: "Implementation of advanced battery management systems has led to a marked decrease in EV fire incidents over the past year.",
                link: "https://www.example.com/ev-safety",
                date: "2025-04-22",
                thumbnail: "https://images.unsplash.com/photo-1596998791979-1296130c2c3e?q=80&w=800&auto=format&fit=crop"
            },
            {
                title: "Regulatory Updates: New Standards for Battery Transportation",
                snippet: "Transportation authorities have introduced stricter regulations for shipping lithium-ion batteries following multiple incidents.",
                link: "https://www.example.com/battery-regulations",
                date: "2025-04-15",
                thumbnail: "https://images.unsplash.com/photo-1582983508991-59607a419255?q=80&w=800&auto=format&fit=crop"
            },
            {
                title: "Industry Leaders Form Coalition to Address Battery Fire Safety",
                snippet: "Major manufacturers have joined forces to establish best practices and fund research into safer battery technologies.",
                link: "https://www.example.com/industry-coalition",
                date: "2025-04-10",
                thumbnail: "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?q=80&w=800&auto=format&fit=crop"
            },
            {
                title: "Advanced Fire Suppression Systems for Battery Storage Facilities",
                snippet: "New specialized fire suppression technology designed specifically for large-scale lithium-ion battery installations shows promising results.",
                link: "https://www.example.com/fire-suppression",
                date: "2025-04-05",
                thumbnail: "https://images.unsplash.com/photo-1605969488889-aa843a386abf?q=80&w=800&auto=format&fit=crop"
            }
        ];
        
        displayNews(mockArticles);
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

// Remove the Express.js endpoint as it's not needed in the client-side code
// This would need to be in a separate server file if you implement a backend
