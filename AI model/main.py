import os
import uuid
import json
import io
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import google.generativeai as genai
from PIL import Image

load_dotenv()

# Configure Gemini API
GENAI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
if GENAI_API_KEY:
    genai.configure(api_key=GENAI_API_KEY)
else:
    print("WARNING: GEMINI_API_KEY environment variable not set. Please set it in .env file.")

app = FastAPI(title="AI Prescription Analyst", version="1.0.0")

# Allow CORS for local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for the dummy database
prescriptions_db = {}

# Pydantic models for incoming JSON requests
class MealCheckRequest(BaseModel):
    prescription_id: str
    meal_description: str

def get_gemini_vision_response(image_bytes: bytes, prompt: str) -> str:
    """Helper to call Gemini 3 Flash Preview with an image and prompt"""
    try:
        model = genai.GenerativeModel('gemini-3-flash-preview')
        image = Image.open(io.BytesIO(image_bytes))
        response = model.generate_content([prompt, image])
        return response.text
    except Exception as e:
        print(f"Gemini API Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def get_gemini_text_response(prompt: str) -> str:
    """Helper to call Gemini 3 Flash Preview with text only"""
    try:
        model = genai.GenerativeModel('gemini-3-flash-preview')
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Gemini API Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/", response_class=HTMLResponse)
async def serve_index():
    with open("index.html", "r", encoding="utf-8") as f:
        return f.read()

@app.post("/upload")
async def upload_prescription(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        prompt = """
        You are an expert AI medical assistant. Analyze the provided prescription image.
        Format your response EXACTLY as a JSON object with the following structure, and do NOT wrap it in markdown block quotes (e.g. no ```json).
        Return ONLY the raw JSON string:
        {
            "title": "A short, descriptive title for the treatment (e.g., 'Hypertension Management' or 'Antibiotic Course')",
            "medicines": [
                {
                    "name": "Medicine Name",
                    "dosage": "Dosage (e.g., 500mg)",
                    "frequency": "Frequency (e.g., Twice a day)",
                    "duration": "Duration (e.g., 5 days)",
                    "purpose": "Patient-friendly purpose of this medicine",
                    "precautions": "Any specific side effects or precautions for this medicine",
                    "reminders": [ "08:00 AM", "08:00 PM" ]
                }
            ],
            "drug_drug_interactions": "Detailed explanation of any interactions between the prescribed medicines. If none, say 'No known significant interactions.'",
            "food_drug_interactions": "General food interactions to avoid while on these medications.",
            "safety_score": "Safe" or "Caution" or "Risk",
            "explanation": "A complete 2-3 paragraph patient-friendly explanation of the whole prescription, what to expect, and overall wellness advice."
        }
        """
        raw_response = get_gemini_vision_response(contents, prompt)
        
        # Clean response string to ensure it's parseable JSON
        response_text = raw_response.strip()
        if response_text.startswith("```json"): response_text = response_text[7:]
        if response_text.startswith("```"): response_text = response_text[3:]
        if response_text.endswith("```"): response_text = response_text[:-3]
        response_text = response_text.strip()
        
        analysis = json.loads(response_text)
        
        presc_id = str(uuid.uuid4())
        record = {
            "id": presc_id,
            "date": "Just now",  # Simplified for demo
            "data": analysis
        }
        prescriptions_db[presc_id] = record
        
        return record
        
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse AI response: {str(e)}. Raw AI response: {raw_response}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/prescriptions")
async def get_prescriptions():
    return list(prescriptions_db.values())

@app.get("/prescription/{id}")
async def get_prescription(id: str):
    if id not in prescriptions_db:
        raise HTTPException(status_code=404, detail="Prescription not found")
    return prescriptions_db[id]

@app.post("/verify-pill")
async def verify_pill(file: UploadFile = File(...), expected_name: str = Form(...)):
    try:
        contents = await file.read()
        prompt = f"""
        You are a pharmaceutical identification expert. Look at this pill/medication image.
        The expected medication name is '{expected_name}'.
        Verify if the image matches the expected medication based on visual characteristics.
        Return ONLY valid JSON (no markdown block quotes) like so:
        {{
            "match": true or false,
            "confidence": "High" or "Medium" or "Low",
            "observations": "What visual characteristics you see vs what was expected",
            "conclusion": "Final verification message suitable for the patient"
        }}
        """
        raw_response = get_gemini_vision_response(contents, prompt)
        
        response_text = raw_response.strip()
        if response_text.startswith("```json"): response_text = response_text[7:]
        if response_text.startswith("```"): response_text = response_text[3:]
        if response_text.endswith("```"): response_text = response_text[:-3]
            
        return json.loads(response_text.strip())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/check-meal")
async def check_meal(req: MealCheckRequest):
    if req.prescription_id not in prescriptions_db:
        raise HTTPException(status_code=404, detail="Prescription not found")
    
    prescription = prescriptions_db[req.prescription_id]["data"]
    meds = [m.get('name', 'Unknown') for m in prescription.get("medicines", [])]
    meds_str = ", ".join(meds)
    
    prompt = f"""
    The patient is taking the following medications: {meds_str}.
    They are planning to eat this meal: "{req.meal_description}".
    
    Act as a medical AI and check for any potential food-drug interactions between this specific meal and these medications.
    Return ONLY valid JSON (no markdown) like so:
    {{
        "safe_to_eat": true or false,
        "warnings": ["Warning 1", "Warning 2"] or [],
        "explanation": "Patient-friendly, detailed explanation of any interactions or why it's completely safe."
    }}
    """
    try:
        raw_response = get_gemini_text_response(prompt)
        
        response_text = raw_response.strip()
        if response_text.startswith("```json"): response_text = response_text[7:]
        if response_text.startswith("```"): response_text = response_text[3:]
        if response_text.endswith("```"): response_text = response_text[:-3]
            
        return json.loads(response_text.strip())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat")
async def chat_with_ai(message: str = Form(...), context: Optional[str] = Form(None)):
    system_prompt = """
    You are the 'MediSafe AI Assistant', a specialized medical AI.
    
    STRICT RULES:
    1. ONLY answer questions related to medical prescriptions, medications, dosages, side effects, health advice, and wellness.
    2. If the user asks about anything irrelevant (e.g., sports, politics, celebrities, coding, or general chat not related to health), politely refuse.
    3. Use the provided 'Context' (which contains the patient's current medications) to give personalized and safe advice.
    4. ALWAYS include a disclaimer that you are an AI and not a substitute for professional medical advice.
    5. Be concise, professional, and empathetic.
    6. If a query is dangerously vague or potentially life-threatening, immediately advise calling emergency services.
    
    Example Refusal: "I'm sorry, as your MediSafe Assistant, I am only able to assist with medication and health-related queries. How can I help you with your prescriptions today?"
    """
    
    full_prompt = f"{system_prompt}\n\n"
    if context:
        full_prompt += f"CONTEXT (Current Medications): {context}\n\n"
    
    full_prompt += f"USER QUERY: {message}\n\nASSISTANT RESPONSE:"
    
    try:
        reply = get_gemini_text_response(full_prompt)
        return {"success": True, "reply": reply}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/dashboard")
async def get_dashboard():
    total = len(prescriptions_db)
    # Default to string 'SAFE' matching
    safe = sum(1 for p in prescriptions_db.values() if str(p["data"].get("safety_score", "")).upper() == "SAFE")
    caution = sum(1 for p in prescriptions_db.values() if str(p["data"].get("safety_score", "")).upper() == "CAUTION")
    risk = sum(1 for p in prescriptions_db.values() if str(p["data"].get("safety_score", "")).upper() == "RISK")
    
    return {
        "total_prescriptions": total,
        "safe_count": safe,
        "caution_count": caution,
        "risk_count": risk
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
