const https = require('https');
const http = require('http');

const getLinkPreview = (url) => {
  return new Promise((resolve, reject) => {
    if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
      return reject(new Error('Invalid URL'));
    }

    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
        if (data.length > 100000) { // Limit to 100KB
          res.destroy();
          return reject(new Error('Response too large'));
        }
      });

      res.on('end', () => {
        try {
          const preview = extractMetaTags(data, url);
          resolve(preview);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', (error) => {
      reject(error);
    });

    setTimeout(() => {
      reject(new Error('Request timeout'));
    }, 5000);
  });
};

const extractMetaTags = (html, url) => {
  const preview = {
    url,
    title: '',
    description: '',
    image: '',
    siteName: ''
  };

  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) {
    preview.title = titleMatch[1].trim().substring(0, 100);
  }

  // Extract Open Graph tags
  const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
  if (ogTitleMatch) {
    preview.title = ogTitleMatch[1].trim().substring(0, 100);
  }

  const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
  if (ogDescMatch) {
    preview.description = ogDescMatch[1].trim().substring(0, 200);
  }

  const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
  if (ogImageMatch) {
    preview.image = ogImageMatch[1].trim();
  }

  const ogSiteMatch = html.match(/<meta[^>]*property=["']og:site_name["'][^>]*content=["']([^"']+)["']/i);
  if (ogSiteMatch) {
    preview.siteName = ogSiteMatch[1].trim();
  }

  // Fallback to meta description
  if (!preview.description) {
    const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    if (metaDescMatch) {
      preview.description = metaDescMatch[1].trim().substring(0, 200);
    }
  }

  // Extract domain name if no site name
  if (!preview.siteName && url) {
    try {
      const urlObj = new URL(url);
      preview.siteName = urlObj.hostname.replace('www.', '');
    } catch (e) {
      preview.siteName = 'Link';
    }
  }

  return preview;
};

module.exports = { getLinkPreview };









