// SerpAPI News integration for lithium-ion battery fire news
document.addEventListener("DOMContentLoaded", function() {
    // Configuration
    const apiKey = "8780a99876523838de6e2ce98fbd3acbd884e8576955ad86085c4d0da76f25c8";
    const searchTerm = "lithium-ion battery fire";
    const numberOfArticles = 3; // Default number to show on the homepage
    
    // DOM Elements
    const newsContainer = document.getElementById("news-container");
    
    // Additional styling for image quality
    const style = document.createElement('style');
    style.textContent = `
        .product-card img {
            image-rendering: high-quality;
            -webkit-font-smoothing: antialiased;
            transform: translateZ(0);
            backface-visibility: hidden;
        }
    `;
    document.head.appendChild(style);
    
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
        
        // Create HTML for each article
        articles.forEach((article, index) => {
            const articleCard = document.createElement("div");
            articleCard.className = "product-card bg-dark rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/10";
            
            // Enhanced thumbnail handling for maximum quality
            let thumbnailUrl;

            if (article.thumbnail) {
                thumbnailUrl = article.thumbnail;

                // Check for SerpAPI low-res thumbnails (any size under 150px)
                const lowResMatch = thumbnailUrl.match(/\/(\d+)x(\d+)\//);
                if (
                    thumbnailUrl.includes('serpapi.com/searches') &&
                    lowResMatch &&
                    (parseInt(lowResMatch[1]) < 150 || parseInt(lowResMatch[2]) < 150)
                ) {
                    // Try to use a domain-specific high-res image
                    const originalUrl = new URL(article.link);
                    const domain = originalUrl.hostname;

                    if (domain.includes('reuters.com')) {
                        thumbnailUrl = `https://www.reuters.com/resizer/placeholder-${index}/_w_1800/_h_1200/reutersmedia/api/`;
                    } else if (domain.includes('bbc.com') || domain.includes('bbc.co.uk')) {
                        thumbnailUrl = `https://ichef.bbci.co.uk/news/1024/branded_news/placeholder-${index}/production/_130000000.jpg`;
                    } else if (domain.includes('theguardian.com')) {
                        thumbnailUrl = `https://i.guim.co.uk/img/media/placeholder-${index}/0/0/3500/2100/master/3500.jpg?width=1800&quality=95&auto=format`;
                    } else {
                        // Default to a placeholder image
                        thumbnailUrl = `https://placehold.co/1800x1200/151515/CCCCCC?text=News+${index+1}`;
                    }
                }
                // Google CDN
                else if (thumbnailUrl.includes('googleusercontent.com')) {
                    thumbnailUrl = thumbnailUrl.replace(/=w\d+-h\d+/, '=w1800-h1200').replace(/=s\d+/, '=s1800');
                    // For newer Google image URLs
                    thumbnailUrl = thumbnailUrl.replace(/=rw-e\d+/, '=rw-e1800').replace(/=w\d+/, '=w1800');
                }
                // WordPress
                else if (thumbnailUrl.includes('wp.com') || thumbnailUrl.includes('wordpress.com')) {
                    thumbnailUrl = thumbnailUrl.includes('?')
                        ? thumbnailUrl + '&w=1800&q=95'
                        : thumbnailUrl + '?w=1800&q=95';
                }
                // Brightspot/Times
                else if (thumbnailUrl.includes('brightspot')) {
                    if (thumbnailUrl.includes('resize')) {
                        thumbnailUrl = thumbnailUrl.replace(/resize\/\d+x\d+/, 'resize/1800x1200');
                    }
                    if (thumbnailUrl.includes('quality')) {
                        thumbnailUrl = thumbnailUrl.replace(/quality\/\d+/, 'quality/95');
                    }
                }
                // Generic CDN
                else if (thumbnailUrl.includes('cdn.') || thumbnailUrl.includes('.cloudfront.')) {
                    thumbnailUrl = thumbnailUrl.includes('?')
                        ? thumbnailUrl + '&quality=95&width=1800'
                        : thumbnailUrl + '?quality=95&width=1800';
                }
                // Any resize param
                else if (thumbnailUrl.match(/resize\/\d+x\d+/)) {
                    thumbnailUrl = thumbnailUrl.replace(/resize\/\d+x\d+/, 'resize/1800x1200');
                }
                // Imgix CDN
                else if (thumbnailUrl.includes('imgix.net')) {
                    thumbnailUrl = thumbnailUrl.includes('?')
                        ? thumbnailUrl + '&w=1800&q=95&auto=format'
                        : thumbnailUrl + '?w=1800&q=95&auto=format';
                }
                // Cloudinary CDN
                else if (thumbnailUrl.includes('cloudinary.com')) {
                    // Replace any existing transformations with our high-quality ones
                    if (thumbnailUrl.includes('/upload/')) {
                        thumbnailUrl = thumbnailUrl.replace(/\/upload\/.*?\//, '/upload/w_1800,q_auto:best,f_auto/');
                    }
                }
                // For Getty Images
                else if (thumbnailUrl.includes('gettyimages')) {
                    thumbnailUrl = thumbnailUrl.replace(/\d+x\d+/, '1800x1200');
                }
                // For known news sites with dynamic image resizing
                else if (thumbnailUrl.match(/\/(resize|resizer|width|size)\/\d+/)) {
                    thumbnailUrl = thumbnailUrl.replace(/\/(resize|resizer|width|size)\/\d+/, '/$1/1800');
                }
                // For URLs with dimensions in query params
                else if (thumbnailUrl.match(/[\?&](w|width)=\d+/)) {
                    thumbnailUrl = thumbnailUrl.replace(/([?&])(w|width)=\d+/g, '$1$2=1800');
                    if (!thumbnailUrl.includes('quality') && !thumbnailUrl.includes('q=')) {
                        thumbnailUrl += thumbnailUrl.includes('?') ? '&quality=95' : '?quality=95';
                    }
                }
            } else {
                // Default placeholder if no thumbnail
                thumbnailUrl = `https://placehold.co/1800x1200/151515/CCCCCC?text=News+${index+1}`;
            }
            
            // Format date - FIX for invalid date issue
            let publishedDate = "Recent";
            
            if (article.date) {
                try {
                    // Handle different date formats that might come from the API
                    if (article.date.includes(',')) {
                        // Format like "11/18/2024, 04:56 PM, +0200 EET"
                        const datePart = article.date.split(',')[0];
                        publishedDate = new Date(datePart).toLocaleDateString();
                    } else if (article.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
                        // ISO format like "2025-05-01"
                        publishedDate = new Date(article.date).toLocaleDateString();
                    } else {
                        // Try direct parsing, fallback to "Recent" if it fails
                        publishedDate = "Recent";
                    }
                } catch (e) {
                    console.warn("Could not parse date:", article.date);
                    publishedDate = "Recent";
                }
            }

            const imgElement = document.createElement("img");
            imgElement.src = thumbnailUrl;
            imgElement.alt = article.title;
            imgElement.className = "w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110";
            
            // Enhanced error handling
            imgElement.onerror = function() {
                // First try: If SerpAPI thumbnail fails, try thumbnail_small if available
                if (article.thumbnail_small) {
                    this.src = article.thumbnail_small;
                    
                    // Setup second fallback if that also fails
                    this.onerror = function() {
                        // Try to derive an image from the source domain
                        const originalUrl = new URL(article.link);
                        const domain = originalUrl.hostname;
                        const domainParts = domain.split('.');
                        const siteName = domainParts.length > 1 ? domainParts[domainParts.length - 2] : domain;
                        
                        // Try a domain-based image
                        this.src = `https://logo.clearbit.com/${domain}?size=1800`;
                        
                        // Third fallback - domain logo failed, use our high-quality stock images
                        this.onerror = function() {
                            // Try stock images based on search terms in the title
                            const keywords = ['battery', 'fire', 'lithium', 'safety', 'electric', 'technology'];
                            const matchedKeywords = keywords.filter(keyword => 
                                article.title.toLowerCase().includes(keyword));
                            
                            if (matchedKeywords.length > 0) {
                                // Use the first matched keyword to find a relevant stock image
                                const keyword = matchedKeywords[0];
                                const stockImages = {
                                    'battery': 'https://images.unsplash.com/photo-1593941707882-a5bba53b0999?q=95&w=1800&auto=format&fit=crop',
                                    'fire': 'https://images.unsplash.com/photo-1625324900743-021238f77615?q=95&w=1800&auto=format&fit=crop',
                                    'lithium': 'https://images.unsplash.com/photo-1626438962886-611a9453d22c?q=95&w=1800&auto=format&fit=crop',
                                    'safety': 'https://images.unsplash.com/photo-1577009683331-5d8ec347bc38?q=95&w=1800&auto=format&fit=crop',
                                    'electric': 'https://images.unsplash.com/photo-1596998791979-1296130c2c3e?q=95&w=1800&auto=format&fit=crop',
                                    'technology': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=95&w=1800&auto=format&fit=crop'
                                };
                                
                                this.src = stockImages[keyword];
                                
                                // Final fallback if even the keyword-based image fails
                                this.onerror = function() {
                                    this.src = `https://placehold.co/1800x1200/151515/CCCCCC?text=News+${index+1}`;
                                };
                            } else {
                                this.src = `https://placehold.co/1800x1200/151515/CCCCCC?text=News+${index+1}`;
                            }
                        };
                    };
                } else {
                    // If no thumbnail_small, try using source favicon or domain logo
                    try {
                        const originalUrl = new URL(article.link);
                        const domain = originalUrl.hostname;
                        
                        // Try getting high-quality favicon first
                        this.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
                        
                        this.onerror = function() {
                            // Try clearbit logo as fallback
                            this.src = `https://logo.clearbit.com/${domain}?size=1800`;
                            
                            // Final fallback
                            this.onerror = function() {
                                this.src = `https://placehold.co/1800x1200/151515/CCCCCC?text=News+${index+1}`;
                            };
                        };
                    } catch (e) {
                        // Direct fallback to placeholder image
                        this.src = `https://placehold.co/1800x1200/151515/CCCCCC?text=News+${index+1}`;
                    }
                }
            };

            imgElement.onload = function() {
                // Replace extremely small images with placeholder
                if (this.naturalWidth < 200 || this.naturalHeight < 120) {
                    this.src = `https://placehold.co/1800x1200/151515/CCCCCC?text=News+${index+1}`;
                }
                
                // Check for transparent or blank images (common issue with some CDNs)
                if (this.src.includes('googleusercontent.com') || this.src.includes('serpapi.com')) {
                    // Create an offscreen canvas to analyze image content
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = Math.min(this.naturalWidth, 50); // Sample a small portion
                    canvas.height = Math.min(this.naturalHeight, 50);
                    
                    try {
                        ctx.drawImage(this, 0, 0, canvas.width, canvas.height);
                        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
                        
                        // Check if the image is blank or mostly transparent
                        let blankPixels = 0;
                        let totalPixels = imageData.length / 4;
                        
                        for (let i = 0; i < imageData.length; i += 4) {
                            // If pixel is white or transparent
                            if ((imageData[i+3] < 10) || // Almost transparent
                                (imageData[i] > 250 && imageData[i+1] > 250 && imageData[i+2] > 250)) { // Almost white
                                blankPixels++;
                            }
                        }
                        
                        // If more than 95% of pixels are blank
                        if (blankPixels / totalPixels > 0.95) {
                            this.src = `https://placehold.co/1800x1200/151515/CCCCCC?text=News+${index+1}`;
                        }
                    } catch (e) {
                        console.warn("Error analyzing image data:", e);
                    }
                }
            };

            articleCard.innerHTML = `
                <div class="relative overflow-hidden h-48 group">
                    <img src="${thumbnailUrl}" alt="${article.title}" class="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110">
                    <div class="absolute inset-0 bg-gradient-to-t from-darker/90 via-darker/30 to-transparent"></div>
                </div>
                <div class="p-6">
                    <span class="text-xs text-slate-500">${publishedDate}</span>
                    <h3 class="text-lg font-bold mb-3 hover:text-primary transition line-clamp-2">${article.title}</h3>
                    <p class="text-sm text-slate-400 mb-4 line-clamp-3">${article.snippet || "Read the full article for more details."}</p>
                    <a href="${article.link}" target="_blank" class="text-primary inline-flex items-center text-sm hover:text-white transition">
                        Read More
                    </a>
                </div>
            `;

            newsContainer.appendChild(articleCard);
        });

        // Make "View All Articles" button functional (but with no icon)
        const viewAllButton = document.querySelector("#news .text-center a");
        if (viewAllButton) {
            viewAllButton.href = `https://www.google.com/search?q=${encodeURIComponent(searchTerm)}&tbm=nws`;
            viewAllButton.innerHTML = "View All Articles"; // Removed the icon
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
                thumbnail: "https://images.unsplash.com/photo-1593941707882-a5bba53b0999?q=95&w=1800&auto=format&fit=crop"
            },
            {
                title: "Research Breakthrough: Fire-Resistant Battery Materials",
                snippet: "Scientists have developed a new composite material that could significantly reduce the risk of thermal runaway in lithium-ion batteries.",
                link: "https://www.example.com/battery-research",
                date: "2025-04-28",
                thumbnail: "https://images.unsplash.com/photo-1626438962886-611a9453d22c?q=95&w=1800&auto=format&fit=crop"
            },
            {
                title: "Electric Vehicle Fire Incidents Down 30% with New Technology",
                snippet: "Implementation of advanced battery management systems has led to a marked decrease in EV fire incidents over the past year.",
                link: "https://www.example.com/ev-safety",
                date: "2025-04-22",
                thumbnail: "https://images.unsplash.com/photo-1596998791979-1296130c2c3e?q=95&w=1800&auto=format&fit=crop"
            },
            {
                title: "Regulatory Updates: New Standards for Battery Transportation",
                snippet: "Transportation authorities have introduced stricter regulations for shipping lithium-ion batteries following multiple incidents.",
                link: "https://www.example.com/battery-regulations",
                date: "2025-04-15",
                thumbnail: "https://images.unsplash.com/photo-1582983508991-59607a419255?q=95&w=1800&auto=format&fit=crop"
            },
            {
                title: "Industry Leaders Form Coalition to Address Battery Fire Safety",
                snippet: "Major manufacturers have joined forces to establish best practices and fund research into safer battery technologies.",
                link: "https://www.example.com/industry-coalition",
                date: "2025-04-10",
                thumbnail: "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?q=95&w=1800&auto=format&fit=crop"
            },
            {
                title: "Advanced Fire Suppression Systems for Battery Storage Facilities",
                snippet: "New specialized fire suppression technology designed specifically for large-scale lithium-ion battery installations shows promising results.",
                link: "https://www.example.com/fire-suppression",
                date: "2025-04-05",
                thumbnail: "https://images.unsplash.com/photo-1605969488889-aa843a386abf?q=95&w=1800&auto=format&fit=crop"
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
