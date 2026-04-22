export interface GeminiMedicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  purpose: string;
  instructions: string;
}

export interface GeminiAnalysisResult {
  medicines: GeminiMedicine[];
  score: "Safe" | "Caution" | "Risk";
  scoreEmoji: string;
  fullExplanation: string;
  precautions: {
    sideEffects: string[];
    warnings: string[];
    avoidThings: string[];
  };
  interactions: Array<{
    type: string;
    description: string;
    severity: "High" | "Medium" | "Low";
  }>;
  reminderTimes: string[];
}

/**
 * Client-side wrapper for calling the Gemini API endpoint
 */
export async function analyzePrescription(
  data: { image?: File; text?: string }
): Promise<GeminiAnalysisResult> {
  try {
    const formData = new FormData();
    if (data.image) formData.append("image", data.image);
    if (data.text) formData.append("text", data.text);

    const response = await fetch("/api/gemini", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Failed to analyze prescription");
    }

    return result.data;
  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    
    // For testing/fallback, return a mock response if needed
    if (process.env.NODE_ENV === "development" && !data.image && !data.text) {
      return getMockResponse();
    }
    
    throw error;
  }
}

/**
 * Mock response for testing purposes
 */
export function getMockResponse(): GeminiAnalysisResult {
  return {
    medicines: [
      {
        name: "Amoxicillin",
        dosage: "500mg",
        frequency: "Three times a day",
        duration: "7 days",
        purpose: "Bacterial infection",
        instructions: "Take after meals"
      }
    ],
    score: "Safe",
    scoreEmoji: "🟢",
    fullExplanation: "The prescription appears to be a standard antibiotic course.",
    precautions: {
      sideEffects: ["Nausea", "Diarrhea"],
      warnings: ["Finish the full course"],
      avoidThings: ["Alcohol"]
    },
    interactions: [],
    reminderTimes: ["08:00", "14:00", "20:00"]
  };
}
