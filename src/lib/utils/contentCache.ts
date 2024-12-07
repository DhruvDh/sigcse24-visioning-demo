const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

interface CachedContent {
  content: string;
  timestamp: number;
}

export async function fetchAndCache(url: string, cacheKey: string): Promise<string> {
  // Check localStorage first
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    const parsedCache: CachedContent = JSON.parse(cached);
    
    // Return cached content if it's less than 24 hours old
    if (Date.now() - parsedCache.timestamp < CACHE_DURATION) {
      return parsedCache.content;
    }
  }

  // Fetch fresh content
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const content = await response.text();
    
    // Cache the new content
    const cacheData: CachedContent = {
      content,
      timestamp: Date.now()
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    
    return content;
  } catch (error) {
    console.error('Error fetching content:', error);
    // Return cached content if available, even if expired
    if (cached) {
      return JSON.parse(cached).content;
    }
    throw error;
  }
} 