# api_endpoints.py

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
import uuid
from datetime import datetime

from prescription_ai_system import CompletePrescriptionSystem, PrescriptionScore

app = FastAPI(title="Prescription AI System")

# CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize AI system
ai_system = CompletePrescriptionSystem()

# In-memory storage (replace with Firebase/Firestore)
prescriptions_db = {}

class PrescriptionResponse(BaseModel):
    id: str
    report: Dict
    alerts: List[Dict]

class PillVerificationRequest(BaseModel):
    medicine_name: str
    image_base64: str

class MealLogRequest(BaseModel):
    medicines: List[str]
    meals: List[str]
    timestamp: str

class AlertAcknowledgment(BaseModel):
    prescription_id: str
    alert_id: str
    acknowledged: bool

@app.post("/api/prescription/upload")
async def upload_prescription(file: UploadFile = File(...)):
    """Upload and process prescription image"""
    try:
        # Save temporarily
        temp_path = f"/tmp/{uuid.uuid4()}.jpg"
        with open(temp_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        # Process with AI
        report = ai_system.process_prescription(temp_path)
        
        # Generate real-time alerts
        user_context = {}  # Get from user session
        alerts = ai_system.real_time_alert(report, user_context)
        
        # Store in database
        prescription_id = str(uuid.uuid4())
        prescriptions_db[prescription_id] = {
            "report": report,
            "alerts": alerts,
            "timestamp": datetime.now().isoformat(),
            "acknowledged_alerts": []
        }
        
        # Cleanup
        os.remove(temp_path)
        
        return PrescriptionResponse(
            id=prescription_id,
            report=report,
            alerts=alerts
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/pill/verify")
async def verify_pill(request: PillVerificationRequest):
    """Visual pill verification"""
    try:
        # Decode base64 image
        import base64
        from PIL import Image
        import io
        
        image_data = base64.b64decode(request.image_base64)
        image = Image.open(io.BytesIO(image_data))
        
        # Save temporarily
        temp_path = f"/tmp/pill_{uuid.uuid4()}.jpg"
        image.save(temp_path)
        
        # Verify
        result = ai_system.pill_agent.verify_pill(temp_path, request.medicine_name)
        
        os.remove(temp_path)
        
        return result
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/lifestyle/check")
async def check_lifestyle_risk(request: MealLogRequest):
    """Check food and lifestyle interactions"""
    try:
        interactions = ai_system.lifestyle_agent.analyze_food_interactions(
            request.medicines,
            request.meals
        )
        
        return {
            "interactions": interactions,
            "has_conflicts": len(interactions) > 0,
            "timestamp": datetime.now().isoformat()
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/prescription/{prescription_id}")
async def get_prescription(prescription_id: str):
    """Retrieve stored prescription report"""
    if prescription_id not in prescriptions_db:
        raise HTTPException(status_code=404, detail="Prescription not found")
    
    return prescriptions_db[prescription_id]

@app.post("/api/caregiver/alert")
async def send_caregiver_alert(prescription_id: str, missed_dose: str):
    """Generate caregiver alert for missed dose"""
    try:
        prescription = prescriptions_db.get(prescription_id)
        if not prescription:
            raise HTTPException(status_code=404, detail="Prescription not found")
        
        patient_name = "Patient"  # Get from user profile
        patient_history = "Regular medication user"  # Get from history
        
        alert = ai_system.caregiver_agent.generate_caregiver_alert(
            patient_name,
            missed_dose,
            patient_history
        )
        
        return {
            "alert_message": alert,
            "prescription_id": prescription_id,
            "missed_dose": missed_dose,
            "timestamp": datetime.now().isoformat()
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/doctor/report")
async def generate_doctor_report(prescription_id: str):
    """Generate physician flash report"""
    try:
        prescription = prescriptions_db.get(prescription_id)
        if not prescription:
            raise HTTPException(status_code=404, detail="Prescription not found")
        
        # Extract data for report
        report = ai_system.doctor_agent.generate_flash_report(
            medication_logs=[],  # Get from user logs
            side_effects=[],  # Get from user logs
            missed_doses=[],  # Get from user logs
            interactions=prescription['report'].get('drug_interactions', [])
        )
        
        return {
            "flash_report": report,
            "prescription_id": prescription_id,
            "generated_for_doctor": True
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/dashboard")
async def get_dashboard():
    """Get all prescriptions for dashboard view"""
    dashboard_data = []
    
    for pid, data in prescriptions_db.items():
        report = data['report']
        dashboard_data.append({
            "id": pid,
            "date": report['basic_info']['upload_date'],
            "title": report['basic_info']['prescription_title'],
            "score": report['score'],
            "medicines_count": len(report['medicines'])
        })
    
    return {
        "prescriptions": dashboard_data,
        "total_count": len(dashboard_data),
        "last_updated": datetime.now().isoformat()
    }

# Run with: uvicorn api_endpoints:app --reload --port 8000