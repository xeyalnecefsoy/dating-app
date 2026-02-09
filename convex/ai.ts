"use strict";
import { action } from "./_generated/server";
import { v } from "convex/values";

export const chatWithDeepSeek = action({
  args: {
    userMessage: v.string(),
    history: v.array(
      v.object({
        role: v.union(v.literal("user"), v.literal("assistant")),
        content: v.string(),
      })
    ),
    scenarioContext: v.string(),
    language: v.string(),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      throw new Error("DeepSeek API Key is not set. Please set DEEPSEEK_API_KEY in Dashboard/Env.");
    }

    const systemPrompt = `
You are a roleplay partner in a dating communication simulator. 
Context: ${args.scenarioContext}
Language: ${args.language === 'az' ? 'Azerbaijani' : 'English'}

Your goal is to help the user practice their social skills. 

RULES FOR GENERATION:
1. **ACT NATURALLY**: Stay strictly in character. Do not be overly formal or robotic.
2. **LANGUAGE (CRITICAL)**: 
   - If speaking Azerbaijani, use **natural, colloquial, spoken Azerbaijani** (Bakı ləhcəsi/müasir danışıq dili). 
   - AVOID unnatural direct translations like "söhbəti axıtmaq" (use "söhbəti davam etdirmək" or "axıcı danışmaq"), "qalabalıq" (use "qələbəlik", "basabas" or "adam çoxdur").
   - Use idioms and phrases that real people use in Azerbaijan.
3. **ANALYSIS**: Provide honest, rigorous analysis of the user's social skills.

Output strictly valid JSON with this format:
{
  "response": "Your character's response text here...",
  "analysis": {
    "tone": "Friendly" | "Assertive" | "Shy" | "Neutral" | "Aggressive",
    "empathy": 0-100,
    "clarity": 0-100,
    "confidence": 0-100,
    "feedback": {
       "en": "Constructive feedback in English",
       "az": "Constructive feedback in Azerbaijani"
    }
  }
}
Do not output markdown code blocks, just the raw JSON.
`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...args.history,
      { role: "user", content: args.userMessage }
    ];

    try {
      const response = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: messages,
          temperature: 0.7,
          response_format: { type: "json_object" } 
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;

      // Parse JSON from content
      try {
        const parsed = JSON.parse(content);
        return parsed;
      } catch (e) {
        console.error("Failed to parse DeepSeek JSON response:", content);
        // Fallback if model fails to output JSON
        return {
          response: content,
          analysis: {
            tone: "Neutral",
            empathy: 50,
            clarity: 50,
            confidence: 50,
            feedback: { en: "AI response format error.", az: "AI format xətası." }
          }
        };
      }

    } catch (error) {
      console.error("DeepSeek Action Error:", error);
      throw new Error("Failed to communicate with DeepSeek AI.");
    }
  },
});
