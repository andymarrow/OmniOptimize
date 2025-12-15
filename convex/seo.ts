import { action, internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// ------------------------------------------------------------------
// 1. PUBLIC QUERIES
// ------------------------------------------------------------------

export const getScannedUrls = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("seo_scans")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
  },
});

export const getScanResult = query({
  args: { scanId: v.id("seo_scans") },
  handler: async (ctx, args) => {
    const scan = await ctx.db.get(args.scanId);
    if (!scan) return null;

    const getUrls = async (data: any) => {
        if (!data) return {};
        return {
            screenshotUrl: data.screenshotId ? await ctx.storage.getUrl(data.screenshotId) : null,
            filmstripUrl: data.filmstripId ? await ctx.storage.getUrl(data.filmstripId) : null, 
        };
    };

    const mobileUrls = await getUrls(scan.mobile);
    const desktopUrls = await getUrls(scan.desktop);

    return { 
        ...scan, 
        mobile: scan.mobile ? { ...scan.mobile, ...mobileUrls } : undefined,
        desktop: scan.desktop ? { ...scan.desktop, ...desktopUrls } : undefined,
    };
  },
});

// ------------------------------------------------------------------
// 2. INTERNAL MUTATIONS
// ------------------------------------------------------------------

export const initScan = internalMutation({
  args: { 
    projectId: v.id("projects"), 
    url: v.string(),
    strategy: v.string() 
  },
  handler: async (ctx, args): Promise<Id<"seo_scans">> => {
    const existing = await ctx.db
      .query("seo_scans")
      .withIndex("by_project_url", (q) => q.eq("projectId", args.projectId).eq("url", args.url))
      .first();

    const initialStatus = {
        status: "pending" as const,
        updatedAt: Date.now()
    };

    const defaultData = {
        performanceScore: 0,
        metrics: {},
        audits: [],
        ...initialStatus
    };

    if (existing) {
        if (args.strategy === 'mobile') {
            const update = existing.mobile ? { ...existing.mobile, ...initialStatus } : defaultData;
            await ctx.db.patch(existing._id, { mobile: update });
        } else {
            const update = existing.desktop ? { ...existing.desktop, ...initialStatus } : defaultData;
            await ctx.db.patch(existing._id, { desktop: update });
        }
        return existing._id;
    } else {
        const newId = await ctx.db.insert("seo_scans", {
            projectId: args.projectId,
            url: args.url,
            mobile: args.strategy === 'mobile' ? defaultData : undefined,
            desktop: args.strategy === 'desktop' ? defaultData : undefined,
        });
        return newId;
    }
  },
});

export const saveScanResult = internalMutation({
  args: {
    scanId: v.id("seo_scans"),
    strategy: v.string(),
    data: v.any(),
    screenshotId: v.optional(v.id("_storage")),
    fullJsonId: v.optional(v.id("_storage")),
    filmstripId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const field = args.strategy === 'mobile' ? 'mobile' : 'desktop';
    
    const resultObject = {
        status: "completed" as const,
        performanceScore: args.data.scores.performance,
        scores: args.data.scores, 
        metrics: args.data.metrics,
        audits: args.data.audits,
        filmstripId: args.filmstripId,
        screenshotId: args.screenshotId,
        fullJsonId: args.fullJsonId,
        updatedAt: Date.now(),
    };

    await ctx.db.patch(args.scanId, {
        [field]: resultObject
    });
  },
});

export const markFailed = internalMutation({
    args: { scanId: v.id("seo_scans"), strategy: v.string() },
    handler: async (ctx, args) => {
        const field = args.strategy === 'mobile' ? 'mobile' : 'desktop';
        const scan = await ctx.db.get(args.scanId);
        const prevData = scan && scan[field as 'mobile' | 'desktop'];
        const fallback = { performanceScore: 0, scores: {}, metrics: {}, audits: [] };

        await ctx.db.patch(args.scanId, { 
            [field]: { 
                ...(prevData || fallback), 
                status: "failed", 
                updatedAt: Date.now() 
            } 
        });
    }
});

// ------------------------------------------------------------------
// 3. HELPER: Smarter Sanitization
// ------------------------------------------------------------------
function sanitizeDetails(details: any) {
    if (!details || !details.items || !Array.isArray(details.items)) {
        return undefined;
    }

    // 1. Expand Allowed Keys to cover Accessibility & User Timing
    const ALLOWED_KEYS = [
        'url', 'label', 'description', 'name', // Added 'name'
        'wastedBytes', 'totalBytes', 'wastedMs', 
        'score', 'size', 'protocol', 'mimeType', 
        'resourceType', 'statusCode', 'group', 'groupLabel',
        'transferSize', 'duration', 'startTime', 'blockingTime', // Added Timing metrics
        'snippet', 'nodeLabel', 'selector' // Added for HTML previews
    ];

    const cleanItems = details.items
        .slice(0, 15) // Increased limit slightly for better context
        .map((item: any) => {
            const newItem: any = {};
            
            // Special Handler: Extract Node/Snippet data before we drop the object
            // This fixes the "Failing Elements" display
            if (item.node) {
                newItem.snippet = item.node.snippet;
                newItem.nodeLabel = item.node.nodeLabel;
                newItem.selector = item.node.selector;
            }

            // Copy Allowed Keys
            for (const key of ALLOWED_KEYS) {
                // Check direct property
                if (item[key] !== undefined && item[key] !== null) {
                    if (typeof item[key] === 'string' && item[key].length > 300) {
                        newItem[key] = item[key].substring(0, 300) + "..."; // Allow longer snippets
                    } else {
                        newItem[key] = item[key];
                    }
                }
            }
            return newItem;
        });

    if (cleanItems.length === 0) return undefined;

    return {
        type: details.type,
        // We MUST pass headings so the frontend knows what columns to draw
        headings: details.headings, 
        items: cleanItems
    };
}

// ------------------------------------------------------------------
// 4. THE ACTION
// ------------------------------------------------------------------

export const performScan = action({
  args: { 
    projectId: v.id("projects"), 
    url: v.string(),
    strategy: v.union(v.literal("mobile"), v.literal("desktop")),
  },
  handler: async (ctx, args): Promise<Id<"seo_scans">> => {
    const API_KEY = process.env.GOOGLE_PAGESPEED_KEY;
    if (!API_KEY) throw new Error("Missing GOOGLE_PAGESPEED_KEY env variable");

    const scanId: Id<"seo_scans"> = await ctx.runMutation(internal.seo.initScan, {
        projectId: args.projectId,
        url: args.url,
        strategy: args.strategy
    });

    console.log(`🚀 Starting ${args.strategy} scan for ${args.url}`);

    try {
        const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(args.url)}&strategy=${args.strategy}&key=${API_KEY}&category=performance&category=accessibility&category=best-practices&category=seo`;
        
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`PageSpeed API Error: ${response.statusText}`);
        }
        const json = await response.json();

        // 1. Process Screenshot
        let screenshotId = undefined;
        const base64Data = json.lighthouseResult?.audits?.['final-screenshot']?.details?.data;
        if (base64Data) {
            const cleanBase64 = base64Data.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");
            const binaryString = atob(cleanBase64);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            const blob = new Blob([bytes], { type: "image/jpeg" });
            screenshotId = await ctx.storage.store(blob);
        }

        // 2. Store Full JSON
        const jsonBlob = new Blob([JSON.stringify(json)], { type: "application/json" });
        const fullJsonId = await ctx.storage.store(jsonBlob);

        // 3. Process Filmstrip
        let filmstripId = undefined;
        const lh = json.lighthouseResult;
        const filmstripData = lh.audits['screenshot-thumbnails']?.details?.items || [];
        
        if (filmstripData.length > 0) {
            const cleanFilmstrip = filmstripData.map((f: any) => ({
                timestamp: f.timing,
                data: f.data
            }));
            const filmstripBlob = new Blob([JSON.stringify(cleanFilmstrip)], { type: "application/json" });
            filmstripId = await ctx.storage.store(filmstripBlob);
        }

        // 4. Extract Scores
        const scores = {
            performance: Math.round((lh.categories.performance?.score || 0) * 100),
            accessibility: Math.round((lh.categories.accessibility?.score || 0) * 100),
            bestPractices: Math.round((lh.categories['best-practices']?.score || 0) * 100),
            seo: Math.round((lh.categories.seo?.score || 0) * 100),
        };

        // 5. Relevant Audits (Filtered & Sanitized)
        const allAudits = Object.values(lh.audits);
        
        const EXCLUDED_AUDITS = ['screenshot-thumbnails', 'final-screenshot', 'full-page-screenshot'];

        const relevantAudits = allAudits
            // @ts-ignore
            .filter((a: any) => {
                if (EXCLUDED_AUDITS.includes(a.id)) return false;
                if (typeof a.score === 'number' && a.score < 0.9) return true;
                if (a.scoreDisplayMode === 'informative' && a.details) return true;
                return false;
            })
            // @ts-ignore
            .map((a: any) => ({
                id: a.id,
                title: a.title,
                description: a.description,
                score: a.score,
                displayValue: a.displayValue,
                savings: a.details?.overallSavingsMs ? `${Math.round(a.details.overallSavingsMs)}ms` : null,
                savingsBytes: a.details?.overallSavingsBytes ? `${Math.round(a.details.overallSavingsBytes / 1024)} KiB` : null,
                group: a.details?.type === 'opportunity' ? 'opportunity' : 'diagnostic',
                // 👇 SAFETY: Use the new strict sanitizer
                details: sanitizeDetails(a.details)
            }))
            .slice(0, 20); // Limit total audits

        const processedData = {
            scores,
            metrics: {
                lcp: lh.audits['largest-contentful-paint']?.displayValue,
                cls: lh.audits['cumulative-layout-shift']?.displayValue,
                fcp: lh.audits['first-contentful-paint']?.displayValue,
                tbt: lh.audits['total-blocking-time']?.displayValue,
                si: lh.audits['speed-index']?.displayValue,
            },
            audits: relevantAudits
        };

        await ctx.runMutation(internal.seo.saveScanResult, {
            scanId,
            strategy: args.strategy,
            data: processedData,
            screenshotId,
            fullJsonId,
            filmstripId
        });

        console.log(`✅ ${args.strategy} scan complete for ${args.url}`);
        return scanId;

    } catch (err) {
        console.error("Scan Failed:", err);
        await ctx.runMutation(internal.seo.markFailed, { scanId, strategy: args.strategy });
        return scanId;
    }
  },
});