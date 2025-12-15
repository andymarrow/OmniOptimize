import { mutation } from "./_generated/server"; // Use 'mutation' not 'internalMutation'
import { v } from "convex/values";

export const savePublicPrediction = mutation({ // Renamed to 'savePublicPrediction'
  args: { scanId: v.id("seo_scans"), result: v.any() },
  handler: async (ctx, args) => {
    const scan = await ctx.db.get(args.scanId);
    if (!scan) return;

    const currentAnalysis = scan.aiAnalysis || { summary: "", visuals: {}, createdAt: Date.now() };

    await ctx.db.patch(args.scanId, {
      aiAnalysis: {
        ...currentAnalysis,
        mlPrediction: {
            category: args.result.category,
            confidence: args.result.confidence,
            timestamp: Date.now()
        }
      }
    });
  }
});