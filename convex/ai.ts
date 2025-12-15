import { action, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal, api } from "./_generated/api";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const saveAnalysis = internalMutation({
  args: {
    scanId: v.id("seo_scans"),
    analysis: v.any(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.scanId, {
      aiAnalysis: {
        summary: args.analysis.summary,
        visuals: args.analysis.visuals,
        roadmap: args.analysis.roadmap, // New field
        createdAt: Date.now(),
      }
    });
  },
});

export const generateInsights = action({
  args: { scanId: v.id("seo_scans") },
  handler: async (ctx, args) => {
    const scan = await ctx.runQuery(api.seo.getScanResult, { scanId: args.scanId });
    if (!scan || !scan.mobile) throw new Error("No scan data found to analyze.");

    const API_KEY = process.env.GOOGLE_GEMINI_KEY;
    if (!API_KEY) throw new Error("Missing GOOGLE_GEMINI_KEY in Convex Dashboard.");

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Prepare context
    const context = {
        url: scan.url,
        scores: scan.mobile.scores, // The 4 main scores
        topIssues: scan.mobile.audits.slice(0, 8).map((a: any) => ({
            title: a.title,
            metric: a.displayValue
        }))
    };

    const prompt = `
      You are an Elite Web Performance Consultant. Analyze this website data:
      ${JSON.stringify(context)}

      Output strict JSON (NO MARKDOWN) with this structure:
      {
        "summary": "A punchy, 2-sentence executive summary of the site's health.",
        "visuals": {
            "confidenceScore": number (0-100),
            "sentimentScore": number (0-100),
            "priorityMatrix": [
                { "task": "Short Task Name", "impact": number (1-10), "effort": number (1-10), "category": "Speed"|"SEO"|"UX" }
            ],
            "radarData": [
                { "subject": "Speed", "A": number (0-100) },
                { "subject": "UX", "A": number (0-100) },
                { "subject": "SEO", "A": number (0-100) },
                { "subject": "Code", "A": number (0-100) },
                { "subject": "Secure", "A": number (0-100) }
            ]
        },
        "roadmap": [
            { 
                "phase": "Immediate (Week 1)", 
                "tasks": ["Task 1 description", "Task 2 description"] 
            },
            { 
                "phase": "Strategic (Month 1)", 
                "tasks": ["Task 3 description", "Task 4 description"] 
            }
        ]
      }
      
      Generate 5-7 items for the Priority Matrix.
      Ensure radarData values reflect the provided scores.
    `;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const analysis = JSON.parse(jsonString);

        await ctx.runMutation(internal.ai.saveAnalysis, {
            scanId: args.scanId,
            analysis: analysis
        });

        return "success";
    } catch (err: any) {
        console.error("Gemini Error:", err);
        throw new Error("AI Analysis Failed.");
    }
  },
});