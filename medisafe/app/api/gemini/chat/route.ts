import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const { message, prescriptionContext } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        success: true,
        reply: "This is a demo mode response since no API key was found. I am your virtual assistant! Please remember to always consult your doctor."
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const contextStr = prescriptionContext && prescriptionContext.length > 0 
      ? `The user is currently taking the following medications: ${JSON.stringify(prescriptionContext)}.` 
      : "The user has no known active prescriptions.";

    const systemPrompt = `You are MediSafe AI, a caring health assistant. ${contextStr}
    Answer their question accurately, helpfully, and with empathy. If you don't know something, suggest consulting their doctor. Keep responses concise but informative. Do not use markdown bolding too much.`;

    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: "I understand my role and have noted the patient's medications. How can I help them?" }] }
      ],
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    
    return NextResponse.json({ success: true, reply: response.text() });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({
      success: true, // Still true so frontend doesn't break, acts as graceful fallback
      reply: "I'm having technical difficulties right now, but you should definitely consult your doctor about this question. Is there anything else I can help with?"
    });
  }
}
