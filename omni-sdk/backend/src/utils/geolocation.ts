import { Reader } from "maxmind";
import * as fs from "fs";
import maxmind from "maxmind";
import * as path from "path";

/**
 * Geolocation utility using MaxMind GeoLite2 database
 * Singleton pattern - reader is initialized once and reused
 */

let reader: Reader<any> | null = null;

/**
 * Initialize the MaxMind reader (called once at startup)
 */
async function initializeReader(): Promise<Reader<any>> {
  if (reader) {
    return reader;
  }

  try {
    const dbPath = path.join(__dirname, "GeoLite2-Country.mmdb");

    if (!fs.existsSync(dbPath)) {
      throw new Error(
        `GeoLite2-Country.mmdb not found at ${dbPath}. Using default fallback "ET".`
      );
    }

    reader = await maxmind.open(dbPath);
    console.log("✓ MaxMind GeoLite2 reader initialized");
    return reader;
  } catch (error) {
    console.error(
      "[Geolocation] Failed to initialize MaxMind reader:",
      error instanceof Error ? error.message : error
    );
    // Return a dummy reader that always returns null, triggering fallback
    return null as any;
  }
}

/**
 * Extract country code from IP address
 * Returns 2-letter ISO country code or "ET" fallback
 *
 * @param ip - IP address to lookup
 * @returns Country code (e.g., "US", "ET", etc.)
 */
export async function getCountryFromIP(ip: string): Promise<string> {
  try {
    // Validate IP format (basic check)
    if (!ip || typeof ip !== "string") {
      return "ET";
    }

    // Clean up IP (x-forwarded-for can be comma-separated list, take first)
    const cleanIp = ip.split(",")[0].trim();

    // Skip private/local IPs
    if (
      cleanIp.startsWith("127.") ||
      cleanIp.startsWith("192.168.") ||
      cleanIp.startsWith("10.") ||
      cleanIp.startsWith("172.") ||
      cleanIp === "::1"
    ) {
      return "ET";
    }

    const readerInstance = await initializeReader();

    if (!readerInstance) {
      return "ET";
    }

    const response = readerInstance.get(cleanIp);

    if (response && response.country && response.country.iso_code) {
      return response.country.iso_code;
    }

    return "ET";
  } catch (error) {
    console.error(
      "[Geolocation] Error looking up IP:",
      error instanceof Error ? error.message : error
    );
    return "ET";
  }
}

/**
 * Get country code from x-forwarded-for header
 * Typically used when behind a proxy (like Render)
 *
 * @param xForwardedFor - x-forwarded-for header value
 * @returns Country code or "ET" fallback
 */
export async function getCountryFromHeader(
  xForwardedFor?: string
): Promise<string> {
  if (!xForwardedFor) {
    return "ET";
  }

  return getCountryFromIP(xForwardedFor);
}
