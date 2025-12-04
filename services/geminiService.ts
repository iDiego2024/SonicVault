import { GoogleGenAI } from "@google/genai";
import { Album } from "../types";

const apiKey = process.env.API_KEY || ''; // Ensure API key is available
const ai = new GoogleGenAI({ apiKey });

/**
 * Analyzes the user's library to answer questions or provide recommendations.
 */
export const askLibraryAssistant = async (
  query: string,
  library: Album[]
): Promise<string> => {
  if (!apiKey) return "Please configure your API_KEY to use the AI Assistant.";

  // Simplify library for token efficiency
  const libraryContext = library.map(a => 
    `- ${a.artist} - ${a.title} (${a.year}) [${a.rating ? a.rating + '/5' : 'Unrated'}] [${a.ownership}] Tags: ${a.tags.join(', ')}`
  ).join('\n');

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `User Query: "${query}"\n\nContext (User's Music Library):\n${libraryContext}`,
      config: {
        systemInstruction: `You are an expert music librarian named "SonicVault AI". 
        You have access to the user's music catalog listed in the context.
        
        Rules:
        1. Answer the user's question based strictly on their library if they ask about stats, specific albums, or filtering.
        2. If they ask for recommendations, suggest items FROM their library that fit the vibe, or suggest similar external artists based on their taste.
        3. Be concise, friendly, and enthusiastic about music.
        4. If the user asks to count things, count them accurately from the list.
        5. Use Markdown for formatting (bolding album titles, lists).`,
        temperature: 0.7,
      },
    });

    return response.text || "I couldn't process that request right now.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I encountered an error connecting to the AI service.";
  }
};

/**
 * Parses raw natural language text into a structured Album object (experimental auto-fill).
 */
export const parseAlbumFromText = async (text: string): Promise<Partial<Album>> => {
  if (!apiKey) return {};

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Extract album details from this text: "${text}"`,
      config: {
        responseMimeType: "application/json",
      },
    });
    
    const jsonStr = response.text?.trim();
    if (jsonStr) {
        return JSON.parse(jsonStr);
    }
    return {};
  } catch (error) {
    return {};
  }
}