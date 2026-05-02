import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface FormattedCredits {
  artist?: string;
  featuring?: string;
  producer?: string;
  lyricist?: string;
  composer?: string;
  mixing?: string;
  mastering?: string;
}

export interface GrowthInsights {
  streamsGrowth: string;
  earningsChange: string;
  performanceSummary: string;
  suggestion: string;
}

export interface NextActions {
  actions: string[];
}

export const geminiService = {
  /**
   * Generates a "Changes Required" message for admins to send to artists.
   */
  async generateChangesRequired(issueType: string, problemDescription: string): Promise<string> {
    const prompt = `
      TASK: Generate a "Changes Required" message for a music distribution platform.
      INPUT:
      - issue_type: ${issueType}
      - problem_description: ${problemDescription}
      
      INSTRUCTIONS:
      - Explain the issue clearly
      - Provide step-by-step solution
      - Keep tone professional and helpful
      - Max 120 words
      
      OUTPUT FORMAT:
      Changes Required:
      [Clear explanation]
      
      How to Fix:
      1. Step 1
      2. Step 2
      3. Step 3
      
      End with: "Once fixed, please resubmit your release."
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text?.trim() || "";
  },

  /**
   * Formats messy, unstructured credits into metadata.
   */
  async formatCredits(rawCredits: string): Promise<FormattedCredits> {
    const prompt = `
      TASK: Extract and format music credits from messy unstructured text.
      INPUT:
      - raw_credits: ${rawCredits}
      
      INSTRUCTIONS:
      - Extract roles: Artist, Featuring, Producer, Lyricist, Composer, Mixing, Mastering
      - Clean and format text
      - Fix capitalization
      - Use JSON format
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            artist: { type: Type.STRING },
            featuring: { type: Type.STRING },
            producer: { type: Type.STRING },
            lyricist: { type: Type.STRING },
            composer: { type: Type.STRING },
            mixing: { type: Type.STRING },
            mastering: { type: Type.STRING },
          }
        }
      }
    });

    try {
      return JSON.parse(response.text || "{}");
    } catch (e) {
      console.error("Failed to parse credits JSON:", e);
      return {};
    }
  },

  /**
   * Analyzes growth and provides short insights.
   */
  async analyzeGrowth(data: {
    currentStreams: number;
    previousStreams: number;
    currentEarnings: number;
    previousEarnings: number;
    totalReleases: number;
  }): Promise<GrowthInsights> {
    const prompt = `
      TASK: Calculate growth and performance summary.
      INPUT:
      - current_streams: ${data.currentStreams}
      - previous_streams: ${data.previousStreams}
      - current_earnings: ${data.currentEarnings}
      - previous_earnings: ${data.previousEarnings}
      - total_releases: ${data.totalReleases}
      
      INSTRUCTIONS:
      - Calculate growth percentage
      - Compare performance
      - Keep it short
      - Use JSON format
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            streamsGrowth: { type: Type.STRING, description: "+X% or -X%" },
            earningsChange: { type: Type.STRING, description: "+X% or -X%" },
            performanceSummary: { type: Type.STRING, description: "1 short line" },
            suggestion: { type: Type.STRING, description: "1 actionable tip" },
          },
          required: ["streamsGrowth", "earningsChange", "performanceSummary", "suggestion"]
        }
      }
    });

    try {
      return JSON.parse(response.text || "{}");
    } catch (e) {
      return {
        streamsGrowth: "0%",
        earningsChange: "0%",
        performanceSummary: "Data processing error.",
        suggestion: "Try refreshing the page."
      };
    }
  },

  /**
   * Suggests next steps for artists.
   */
  async suggestNextActions(data: {
    streamsTrend: 'increasing' | 'decreasing' | 'stable';
    releaseFrequency: 'low' | 'medium' | 'high';
    bestSongStreams: number;
    averageStreams: number;
  }): Promise<NextActions> {
    const prompt = `
      TASK: Suggest 3-4 practical actions for an artist based on their stats.
      INPUT:
      - streams_trend: ${data.streamsTrend}
      - release_frequency: ${data.releaseFrequency}
      - best_song_streams: ${data.bestSongStreams}
      - average_streams: ${data.averageStreams}
      
      INSTRUCTIONS:
      - Suggest 3–4 actions
      - Keep practical and specific
      - Max 80 words in total
      - Use JSON format
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            actions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["actions"]
        }
      }
    });

    try {
      return JSON.parse(response.text || "{ \"actions\": [] }");
    } catch (e) {
      return { actions: ["Maintain consistent releases", "Engage with fans on social media", "Try promoting your best song"] };
    }
  },

  /**
   * Generates catchy social media captions for a release.
   */
  async generateCaptions(title: string, artist: string): Promise<string[]> {
    const prompt = `
      TASK: Generate 3 professional and catchy social media captions for a music release.
      INPUT:
      - Title: ${title}
      - Artist: ${artist}
      
      INSTRUCTIONS:
      - 3 distinct captions (one hype, one professional, one artistic)
      - Include hashtags
      - Return as a JSON array of strings
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            captions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["captions"]
        }
      }
    });

    try {
      const parsed = JSON.parse(response.text || "{}");
      return parsed.captions || [];
    } catch (e) {
      return [
        `🔥 OUT NOW! "${title}" by ${artist} is streaming on all platforms. #GatiDistro #NewMusic`,
        `The wait is over. Experience "${title}" by ${artist} now. #FreshDrop #ArtistLife`,
        `Turn it up! 🔊 "${title}" is finally here. #NowPlaying #${artist.replace(/\s+/g, '')}`
      ];
    }
  }
};
