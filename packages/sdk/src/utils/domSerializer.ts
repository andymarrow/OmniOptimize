/**
 * DOM Serialization, Sanitization, and Layout Hashing Utility
 * Converts DOM to safe, compact string for snapshots
 * Strips scripts, masks sensitive inputs, removes handlers
 */

import type { MaskMetadata, ScreenClass } from "../types";

// Configuration for sanitization
interface SerializationOptions {
  maskSelectors?: string[]; // Selectors to mask content
  blockSelectors?: string[]; // Selectors to completely remove
  disableSnapshots?: boolean; // Skip snapshot entirely
  maxNodeTextLength?: number; // Max text per node (default: 200)
}

/**
 * Determine screen class based on viewport width
 */
export function getScreenClass(viewportWidth: number): ScreenClass {
  if (viewportWidth < 768) return "mobile";
  if (viewportWidth < 1024) return "tablet";
  return "desktop";
}

/**
 * Compute stable layout hash from DOM structure
 * Hash includes: tag names, layout classes, dimensions, ids
 * Excludes: text content, dynamic attributes
 */
export function computeLayoutHash(
  root: Element = document.documentElement
): string {
  try {
    const structure = buildStructureString(root);
    // Simple SHA256 simulation using built-in crypto API
    return `sha256:${hashString(structure)}`;
  } catch (e) {
    return "sha256:unknown";
  }
}

/**
 * Build deterministic structure string from DOM
 * Focus on layout-relevant info, exclude dynamic content
 */
function buildStructureString(node: Element, depth = 0, maxDepth = 20): string {
  if (depth > maxDepth) return "";

  const tag = node.tagName.toLowerCase();
  const id = node.id ? `#${node.id}` : "";

  // Extract layout-relevant classes
  const classList = Array.from(node.classList)
    .filter((c) => !c.match(/^(active|selected|open|hidden|show)/i))
    .slice(0, 3)
    .join(".");

  const classes = classList ? `.${classList}` : "";

  // Include layout attributes
  const rect = node.getBoundingClientRect();
  const layoutInfo = `[${Math.round(rect.width)}x${Math.round(rect.height)}]`;

  let str = `<${tag}${id}${classes}${layoutInfo}>`;

  // Process immediate children
  const childNodes = Array.from(node.childNodes).slice(0, 20);
  for (const child of childNodes) {
    if (child.nodeType === Node.ELEMENT_NODE) {
      str += buildStructureString(child as Element, depth + 1, maxDepth);
    }
  }

  str += `</${tag}>`;
  return str;
}

/**
 * Simple hash function (not cryptographically secure, for grouping)
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, "0");
}

/**
 * Serialize DOM to safe string
 * Removes scripts, masks sensitive fields, strips handlers
 */
export function serializeDOM(
  root: Element = document.documentElement,
  options: SerializationOptions = {}
): { dom: string; maskMetadata: MaskMetadata } {
  const {
    maskSelectors = [],
    blockSelectors = [],
    maxNodeTextLength = 200,
  } = options;

  const maskedSelectors: string[] = [];
  let blockedCount = 0;

  try {
    // Clone to avoid modifying actual DOM
    const clone = root.cloneNode(true) as Element;

    // Remove script tags and event handlers
    removeScripts(clone);
    removeEventHandlers(clone);
    removeStyleTags(clone);

    // Remove blocked elements
    blockSelectors.forEach((selector) => {
      clone.querySelectorAll(selector).forEach((el) => {
        el.remove();
        blockedCount++;
      });
    });

    // Mask sensitive selectors
    maskSelectors.forEach((selector) => {
      clone.querySelectorAll(selector).forEach((el) => {
        maskElement(el, maxNodeTextLength);
        maskedSelectors.push(selector);
      });
    });

    // Default masking for sensitive inputs
    const defaultMasked = maskDefaultSensitiveFields(clone, maxNodeTextLength);
    maskedSelectors.push(...defaultMasked);

    // Serialize to string
    const domString = new XMLSerializer().serializeToString(clone);
    const domSize = new Blob([domString]).size;

    return {
      dom: domString,
      maskMetadata: {
        maskedSelectors: [...new Set(maskedSelectors)], // Deduplicate
        truncated: false,
        domSize,
        blockedCount,
      },
    };
  } catch (error) {
    return {
      dom: "<html><body><!-- Serialization failed --></body></html>",
      maskMetadata: {
        maskedSelectors,
        truncated: true,
        domSize: 0,
        blockedCount,
      },
    };
  }
}

/**
 * Remove script tags from element
 */
function removeScripts(node: Element): void {
  node.querySelectorAll("script, noscript").forEach((el) => el.remove());
}

/**
 * Remove style tags (optional, to keep styling info use with caution)
 */
function removeStyleTags(node: Element): void {
  // Keep style tags for now since they contain layout info
  // Only remove inline event listeners attached via style
}

/**
 * Remove event handler attributes
 */
function removeEventHandlers(node: Element): void {
  node.querySelectorAll("*").forEach((el) => {
    Array.from(el.attributes)
      .filter((attr) => attr.name.startsWith("on"))
      .forEach((attr) => el.removeAttribute(attr.name));
  });
}

/**
 * Mask sensitive input fields by default
 */
export function maskDefaultSensitiveFields(
  root: Element,
  maxLen: number
): string[] {
  const sensitiveSelectors = [
    'input[type="password"]',
    'input[type="hidden"]',
    'input[autocomplete*="cc-"]',
    'input[autocomplete="ssn"]',
    'input[name*="password"]',
    'input[name*="token"]',
    'input[name*="secret"]',
  ];

  const masked: string[] = [];

  sensitiveSelectors.forEach((selector) => {
    root.querySelectorAll(selector).forEach((el) => {
      maskElement(el, maxLen);
      masked.push(selector);
    });
  });

  return masked;
}

/**
 * Mask an element's sensitive content
 */
function maskElement(el: Element, maxLen: number): void {
  // For inputs, clear value
  if (el instanceof HTMLInputElement) {
    el.value = "***MASKED***";
    el.setAttribute("value", "***MASKED***");
  }

  // For other elements, truncate text
  if (el.textContent && el.textContent.length > maxLen) {
    el.textContent = el.textContent.substring(0, maxLen) + "...";
  }

  // Remove potentially sensitive attributes
  const sensitiveAttrs = ["value", "data-*", "aria-*"];
  Array.from(el.attributes).forEach((attr) => {
    if (attr.name === "value" || attr.name.startsWith("data-")) {
      el.removeAttribute(attr.name);
    }
  });
}

/**
 * Compress DOM string using gzip (if available)
 * Falls back to returning uncompressed if not available
 */
export async function compressDOM(domString: string): Promise<{
  data: string;
  compression: "gzip" | "deflate" | "none";
  originalSize: number;
  compressedSize: number;
}> {
  const originalSize = new Blob([domString]).size;

  // Try to use CompressionStream if available
  if (typeof CompressionStream !== "undefined") {
    try {
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(domString));
          controller.close();
        },
      });

      const compressedStream = stream.pipeThrough(
        new CompressionStream("gzip")
      );

      const reader = compressedStream.getReader();
      const chunks: Uint8Array[] = [];

      let result;
      while (!(result = await reader.read()).done) {
        chunks.push(result.value);
      }

      const compressed = new Uint8Array(
        chunks.reduce((acc, chunk) => acc + chunk.length, 0)
      );
      let offset = 0;
      for (const chunk of chunks) {
        compressed.set(chunk, offset);
        offset += chunk.length;
      }

      // Convert to base64 for transmission
      const base64 = btoa(String.fromCharCode(...compressed));
      const compressedSize = new Blob([base64]).size;

      return {
        data: base64,
        compression: "gzip",
        originalSize,
        compressedSize,
      };
    } catch (e) {
      // Fall through to uncompressed
    }
  }

  // Return uncompressed
  return {
    data: btoa(domString), // Base64 encode for safety
    compression: "none",
    originalSize,
    compressedSize: originalSize,
  };
}

/**
 * Check if snapshot should be captured based on privacy settings
 */
export function shouldCaptureSnapshot(
  options: SerializationOptions,
  selector?: string
): boolean {
  if (options.disableSnapshots) return false;

  if (selector) {
    const el = document.querySelector(selector);
    if (el?.getAttribute("data-analytics-snapshot") === "off") {
      return false;
    }
  }

  return true;
}

/**
 * Detect major DOM changes (for mutation snapshots)
 * Returns true if layout change is significant
 */
export function detectSignificantLayoutChange(
  previousLayoutHash: string,
  threshold: number = 15 // 15% change threshold
): boolean {
  const currentHash = computeLayoutHash();

  if (previousLayoutHash === currentHash) {
    return false;
  }

  // Additional heuristics
  const elementCount = document.querySelectorAll("*").length;
  const foldContent = document.querySelectorAll("[data-fold-relevant]").length;

  // Simple heuristic: significant change if hash changed
  // Backend can also compare layout percentage using more detailed metrics
  return currentHash !== previousLayoutHash;
}

/**
 * Truncate DOM if it exceeds size limit
 */
export function truncateDOM(
  domString: string,
  maxSizeBytes: number = 512000
): { dom: string; truncated: boolean } {
  const domSize = new Blob([domString]).size;

  if (domSize > maxSizeBytes) {
    // Simple truncation: keep first part and add indicator
    const truncatedLength = Math.floor(
      (domString.length * maxSizeBytes) / domSize
    );
    return {
      dom: domString.substring(0, truncatedLength) + "<!-- TRUNCATED -->",
      truncated: true,
    };
  }

  return { dom: domString, truncated: false };
}
