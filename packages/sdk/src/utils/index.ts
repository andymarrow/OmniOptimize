/**
 * UUID generation utility
 */

export function generateUUID(): string {
  // Simple UUID v4 implementation
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback for environments without crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Generate CSS selector for an element
 */
export function generateCSSSelector(element: Element): string {
  if (element.id) {
    return `#${element.id}`;
  }

  const names: string[] = [];
  let current: Element | null = element;

  while (current && current.nodeType === Node.ELEMENT_NODE) {
    let name = current.nodeName.toLowerCase();

    if (current.id) {
      names.unshift(`#${current.id}`);
      break;
    } else {
      let sibling = current;
      let siblingIndex = 1;

      while ((sibling = sibling.previousElementSibling as Element)) {
        if (sibling.nodeName.toLowerCase() === name) {
          siblingIndex++;
        }
      }

      if (siblingIndex > 1) {
        name += `:nth-of-type(${siblingIndex})`;
      }
    }

    names.unshift(name);
    current = current.parentElement;

    // Stop at document or body level
    if (current && (current.nodeName.toLowerCase() === 'body' || !current.parentElement)) {
      names.unshift(current.nodeName.toLowerCase());
      break;
    }
  }

  return names.join(' > ');
}

/**
 * Generate XPath for an element
 */
export function generateXPath(element: Element): string {
  const paths: string[] = [];
  let current: Element | null = element;

  while (current && current.nodeType === Node.ELEMENT_NODE) {
    let index = 1;
    let sibling = current.previousElementSibling;

    while (sibling) {
      if (sibling.nodeName === current.nodeName) {
        index++;
      }
      sibling = sibling.previousElementSibling;
    }

    const name = current.nodeName.toLowerCase();
    paths.unshift(`${name}[${index}]`);
    current = current.parentElement;
  }

  return `/${paths.join('/')}`;
}

/**
 * Get page and viewport dimensions
 */
export function getPageDimensions(): { pageDimensions: { w: number; h: number }; viewport: { w: number; h: number } } {
  if (typeof window === 'undefined') {
    return {
      pageDimensions: { w: 0, h: 0 },
      viewport: { w: 0, h: 0 },
    };
  }

  return {
    pageDimensions: {
      w: document.documentElement.scrollWidth,
      h: document.documentElement.scrollHeight,
    },
    viewport: {
      w: window.innerWidth,
      h: window.innerHeight,
    },
  };
}

/**
 * Get current page URL and referrer
 */
export function getPageContext(): { url: string; referrer: string } {
  if (typeof window === 'undefined') {
    return { url: '', referrer: '' };
  }

  return {
    url: window.location.href,
    referrer: document.referrer,
  };
}

/**
 * Get current page title
 */
export function getPageTitle(): string {
  return typeof document !== 'undefined' ? document.title : '';
}

/**
 * Get current page route/pathname
 */
export function getPageRoute(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  return window.location.pathname;
}
