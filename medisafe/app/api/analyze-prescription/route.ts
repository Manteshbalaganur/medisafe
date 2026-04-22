import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Define the response schema for Gemini to ensure consistent output
const responseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    medicines: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          name: { type: SchemaType.STRING },
          dosage: { type: SchemaType.STRING },
          frequency: { type: SchemaType.STRING },
          duration: { type: SchemaType.STRING },
          purpose: { type: SchemaType.STRING },
          instructions: { type: SchemaType.STRING },
        },
        required: ["name", "dosage", "frequency", "duration", "purpose", "instructions"],
      },
    },
    score: { 
      type: SchemaType.STRING,
      enum: ["Safe", "Caution", "Risk"]
    },
    scoreEmoji: { type: SchemaType.STRING },
    fullExplanation: { type: SchemaType.STRING },
    precautions: {
      type: SchemaType.OBJECT,
      properties: {
        sideEffects: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        warnings: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        avoidThings: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
      },
      required: ["sideEffects", "warnings", "avoidThings"],
    },
    interactions: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          type: { type: SchemaType.STRING },
          description: { type: SchemaType.STRING },
          severity: { 
            type: SchemaType.STRING,
            enum: ["High", "Medium", "Low"]
          },
        },
        required: ["type", "description", "severity"],
      },
    },
    reminderTimes: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
  },
  required: ["medicines", "score", "scoreEmoji", "fullExplanation", "precautions", "interactions", "reminderTimes"],
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const image = formData.get("image") as File | null;
    const text = formData.get("text") as string | null;

    if (!image && !text) {
      return NextResponse.json(
        { success: false, error: "No prescription image or text provided" },
        { status: 400 }
      );
    }

    // Configure model with JSON response mode
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3-flash-preview",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const prompt = `
      You are a professional medical assistant. Analyze the provided prescription (either as an image or text).
      Extract all medicines with their details.
      Provide a safety score ("Safe", "Caution", or "Risk") and an appropriate emoji.
      Explain the overall prescription in detail.
      Identify potential side effects, warnings, and things to avoid.
      Crucially, identify any drug-drug or drug-food interactions.
      Suggest appropriate reminder times for the medicines based on the frequency.
      
      Return ONLY the structured JSON data according to the schema.
    `;

    let result;
    if (image) {
      const bytes = await image.arrayBuffer();
      const base64Data = Buffer.from(bytes).toString("base64");
      
      result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Data,
            mimeType: image.type,
          },
        },
      ]);
    } else {
      result = await model.generateContent([prompt, text || ""]);
    }

    const response = await result.response;
    const data = JSON.parse(response.text());

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Prescription analysis error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to analyze prescription", 
        details: error.message 
      },
      { status: 500 }
    );
  }
}
