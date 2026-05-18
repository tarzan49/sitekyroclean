/**
 * HTML Sanitization utilities to prevent XSS attacks
 * Used for safely rendering HTML content from translation files
 */

// Allowed HTML tags for i18n content
const ALLOWED_TAGS = ['strong', 'b', 'em', 'i', 'u', 'br', 'p', 'span', 'a', 'ul', 'ol', 'li'];

// Allowed attributes per tag
const ALLOWED_ATTRS: Record<string, string[]> = {
  'a': ['href', 'target', 'rel'],
  'span': ['class'],
  'p': ['class'],
};

// Patterns to strip
const DANGEROUS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi, // onclick, onerror, etc.
  /data:/gi,
  /vbscript:/gi,
];

/**
 * Sanitize HTML string to prevent XSS attacks
 * Only allows safe HTML tags and removes dangerous patterns
 */
export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  // For simple strings without HTML tags, return as-is
  if (!/<[^>]+>/.test(html)) {
    return html;
  }

  let sanitized = html;

  // Remove dangerous patterns first
  for (const pattern of DANGEROUS_PATTERNS) {
    sanitized = sanitized.replace(pattern, '');
  }

  // Check if we're in a browser environment with DOMParser
  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
    // Fallback: strip all HTML tags if DOMParser is not available
    return sanitized.replace(/<[^>]*>/g, '');
  }

  try {
    // Create a temporary DOM element to parse HTML
    const doc = new DOMParser().parseFromString(sanitized, 'text/html');
    
    // Safety check for doc.body
    if (!doc || !doc.body) {
      return sanitized.replace(/<[^>]*>/g, '');
    }
    
    // Recursively clean the DOM
    const cleanNode = (node: Node): void => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        const tagName = element.tagName.toLowerCase();
        
        // Remove disallowed tags but keep their text content
        if (!ALLOWED_TAGS.includes(tagName)) {
          const textContent = element.textContent || '';
          const textNode = document.createTextNode(textContent);
          element.replaceWith(textNode);
          return;
        }
        
        // Remove disallowed attributes
        const allowedAttrs = ALLOWED_ATTRS[tagName] || [];
        const attrsToRemove: string[] = [];
        
        for (const attr of element.attributes) {
          if (!allowedAttrs.includes(attr.name.toLowerCase())) {
            attrsToRemove.push(attr.name);
          } else if (attr.name === 'href') {
            // Validate href doesn't contain javascript:
            const hrefValue = attr.value.toLowerCase().trim();
            if (hrefValue.startsWith('javascript:') || hrefValue.startsWith('data:')) {
              attrsToRemove.push(attr.name);
            }
          }
        }
        
        for (const attr of attrsToRemove) {
          element.removeAttribute(attr);
        }
        
        // Ensure external links have safe attributes
        if (tagName === 'a') {
          element.setAttribute('rel', 'noopener noreferrer');
        }
      }
      
      // Clean child nodes
      for (const child of Array.from(node.childNodes)) {
        cleanNode(child);
      }
    };
    
    cleanNode(doc.body);
    
    return doc.body.innerHTML;
  } catch (error) {
    // If parsing fails, return text without HTML tags
    console.warn('sanitizeHtml: Failed to parse HTML, stripping tags', error);
    return sanitized.replace(/<[^>]*>/g, '');
  }
}

/**
 * Escape HTML entities to prevent XSS
 * Use this when you want to display text without HTML rendering
 */
export function escapeHtml(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  
  return text.replace(/[&<>"'/]/g, (char) => htmlEscapes[char] || char);
}
