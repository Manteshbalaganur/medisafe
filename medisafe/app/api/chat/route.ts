import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { success: false, error: "Invalid request: messages array is required" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    // Prepare history for Gemini
    // Note: Gemini expects 'user' and 'model' roles. Our frontend uses 'user' and 'assistant'.
    const history = messages.slice(0, -1).map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    const currentMessage = messages[messages.length - 1].content;

    const chat = model.startChat({
      history: history,
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });

    const systemPrompt = "You are MediSafe AI, a professional and empathetic medical assistant. Provide accurate, helpful, and concise information about medications, health schedules, and general wellness. Always include a disclaimer that you are an AI and the user should consult a real doctor for medical decisions.";

    const result = await chat.sendMessage([systemPrompt, currentMessage]);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ 
      success: true, 
      content: text 
    });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to generate AI response", 
        details: error.message 
      },
      { status: 500 }
    );
  }
}
