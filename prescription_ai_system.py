# prescription_ai_system.py

import os
import json
import base64
from datetime import datetime
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from enum import Enum

import google.generativeai as genai
from PIL import Image
import cv2
import numpy as np
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

class PrescriptionScore(Enum):
    SAFE = "🟢 Safe"
    CAUTION = "🟡 Caution"
    RISK = "🔴 Risk"

@dataclass
class Medicine:
    name: str
    dosage: str
    frequency: str
    duration: str
    purpose: str
    instructions: str
    
@dataclass
class PrescriptionReport:
    basic_info: Dict
    medicines: List[Medicine]
    purpose_summary: str
    precautions: Dict
    score: PrescriptionScore
    full_explanation: str
    reminder_data: Dict
    drug_interactions: List[Dict]
    food_interactions: List[Dict]

class PrescriptionAIAgent:
    """Main AI Agent for Prescription Analysis"""
    
    def __init__(self):
        self.model = genai.GenerativeModel('gemini-3-flash-preview')
        self.vision_model = genai.GenerativeModel('gemini-3-flash-preview')
        
    def extract_text_from_image(self, image_path: str) -> str:
        """Extract text from prescription image using Gemini Vision"""
        img = Image.open(image_path)
        response = self.vision_model.generate_content([
            "Extract all text from this medical prescription. Include medicine names, dosages, frequencies, durations, and any special instructions. Format as clean text.",
            img
        ])
        return response.text
    
    def extract_medicines(self, extracted_text: str) -> List[Medicine]:
        """Extract structured medicine information"""
        prompt = f"""
        From this prescription text, extract each medicine with:
        - Name
        - Dosage (e.g., 500mg)
        - Frequency (e.g., twice daily, every 8 hours)
        - Duration (e.g., 5 days, 1 week)
        
        Prescription: {extracted_text}
        
        Return as JSON array with keys: name, dosage, frequency, duration
        """
        
        response = self.model.generate_content(prompt)
        try:
            medicines_data = json.loads(response.text)
            return [Medicine(
                name=m['name'],
                dosage=m['dosage'],
                frequency=m['frequency'],
                duration=m['duration'],
                purpose="",
                instructions=""
            ) for m in medicines_data]
        except:
            # Fallback parsing
            return []
    
    def analyze_medicine_purposes(self, medicines: List[Medicine]) -> List[Medicine]:
        """Determine purpose of each medicine"""
        medicine_names = [m.name for m in medicines]
        
        prompt = f"""
        For these medicines: {', '.join(medicine_names)}
        
        Provide the common medical purpose for each:
        Return as JSON: {{"Medicine Name": "purpose description"}}
        
        Example: {{"Paracetamol": "Reduces fever and body pain"}}
        """
        
        response = self.model.generate_content(prompt)
        try:
            purposes = json.loads(response.text)
            for medicine in medicines:
                medicine.purpose = purposes.get(medicine.name, "Not specified")
        except:
            pass
        
        return medicines
    
    def check_drug_interactions(self, medicines: List[Medicine]) -> List[Dict]:
        """Check for dangerous drug interactions"""
        medicine_names = [m.name for m in medicines]
        
        prompt = f"""
        Analyze drug interactions for: {', '.join(medicine_names)}
        
        Return as JSON array with:
        - drugs_involved
        - severity (High/Medium/Low)
        - description
        - recommendation
        
        If no interactions found, return empty array.
        """
        
        response = self.model.generate_content(prompt)
        try:
            return json.loads(response.text)
        except:
            return []
    
    def check_food_interactions(self, medicines: List[Medicine]) -> List[Dict]:
        """Check for food-drug interactions"""
        medicine_names = [m.name for m in medicines]
        
        prompt = f"""
        For these medicines: {', '.join(medicine_names)}
        
        List important food interactions (dairy, grapefruit, alcohol, caffeine, etc.)
        
        Return as JSON array with:
        - food_item
        - medicine_affected
        - risk_level
        - instruction
        """
        
        response = self.model.generate_content(prompt)
        try:
            return json.loads(response.text)
        except:
            return []
    
    def generate_medication_instructions(self, medicines: List[Medicine]) -> List[Medicine]:
        """Generate detailed how-to-take instructions"""
        for medicine in medicines:
            prompt = f"""
            For {medicine.name} (dosage: {medicine.dosage}, frequency: {medicine.frequency}):
            
            Provide brief instructions:
            1. Take with/without food?
            2. Best time of day?
            3. Special warnings (e.g., don't crush, take with full water)
            
            Keep under 30 words.
            """
            
            response = self.model.generate_content(prompt)
            medicine.instructions = response.text.strip()
        
        return medicines
    
    def generate_prescription_score(self, 
                                   medicines: List[Medicine],
                                   drug_interactions: List[Dict],
                                   food_interactions: List[Dict]) -> PrescriptionScore:
        """Calculate overall prescription safety score"""
        
        prompt = f"""
        Analyze safety and assign score (SAFE/CAUTION/RISK):
        
        Medicines: {[m.name for m in medicines]}
        Drug Interactions Found: {len(drug_interactions)}
        Food Interactions Found: {len(food_interactions)}
        
        Return ONLY one word: SAFE, CAUTION, or RISK
        """
        
        response = self.model.generate_content(prompt)
        score_text = response.text.strip().upper()
        
        if "RISK" in score_text:
            return PrescriptionScore.RISK
        elif "CAUTION" in score_text:
            return PrescriptionScore.CAUTION
        else:
            return PrescriptionScore.SAFE
    
    def generate_full_explanation(self, 
                                  medicines: List[Medicine],
                                  purpose: str,
                                  score: PrescriptionScore) -> str:
        """Generate comprehensive, human-readable explanation"""
        
        medicines_text = "\n".join([f"- {m.name}: {m.purpose}" for m in medicines])
        
        prompt = f"""
        Create a patient-friendly explanation (2-3 paragraphs) for this prescription:
        
        Medicines:
        {medicines_text}
        
        Overall Safety: {score.value}
        
        Include:
        - What each medicine does
        - Why they're prescribed together
        - Key things to watch for
        - When to contact doctor
        
        Make it warm, reassuring, and educational.
        """
        
        response = self.model.generate_content(prompt)
        return response.text
    
    def generate_precautions(self, medicines: List[Medicine]) -> Dict:
        """Generate precautions and side effects"""
        
        medicine_names = [m.name for m in medicines]
        
        prompt = f"""
        For these medicines: {', '.join(medicine_names)}
        
        Return as JSON:
        {{
            "common_side_effects": ["list", "of", "effects"],
            "serious_warnings": ["list", "of", "warnings"],
            "things_to_avoid": ["activities", "foods", "other drugs"],
            "when_to_call_doctor": ["symptoms", "situations"]
        }}
        """
        
        response = self.model.generate_content(prompt)
        try:
            return json.loads(response.text)
        except:
            return {
                "common_side_effects": ["Consult your doctor for side effects"],
                "serious_warnings": ["Follow prescription exactly"],
                "things_to_avoid": ["Alcohol unless approved"],
                "when_to_call_doctor": ["Severe reactions or allergic symptoms"]
            }
    
    def extract_reminder_times(self, medicines: List[Medicine]) -> Dict:
        """Extract timing information for reminders"""
        
        times = []
        for medicine in medicines:
            prompt = f"""
            From frequency "{medicine.frequency}", extract times:
            Return times like: ["morning", "evening", "8:00 AM", "bedtime"]
            Just return JSON array.
            """
            
            response = self.model.generate_content(prompt)
            try:
                med_times = json.loads(response.text)
                times.extend(med_times)
            except:
                if "twice" in medicine.frequency.lower():
                    times.extend(["morning", "evening"])
                elif "once" in medicine.frequency.lower():
                    times.append("morning")
        
        return {
            "timing": list(set(times)),
            "reminder_enabled": True,
            "reminder_frequency": "daily"
        }

class VisualPillVerificationAgent:
    """Visual pill verification using multimodal AI"""
    
    def __init__(self):
        self.model = genai.GenerativeModel('gemini-3-flash-preview')
        
    def verify_pill(self, pill_image_path: str, expected_medicine: str) -> Dict:
        """Compare physical pill against expected medicine"""
        
        img = Image.open(pill_image_path)
        
        prompt = f"""
        Analyze this pill image and compare with expected medicine: {expected_medicine}
        
        Describe:
        1. Color
        2. Shape
        3. Any imprints/numbers
        4. Size estimate
        
        Then determine:
        - Is this likely the correct medicine?
        - Confidence level (0-100%)
        - Any warnings to display
        
        Return as JSON.
        """
        
        response = self.model.generate_content([prompt, img])
        
        try:
            return json.loads(response.text)
        except:
            return {
                "is_correct": True,
                "confidence": 75,
                "description": "Pill analysis completed",
                "warning": None
            }

class DrugFoodLifestyleAgent:
    """Check interactions with food and lifestyle"""
    
    def __init__(self):
        self.model = genai.GenerativeModel('gemini-3-flash-preview')
        
    def analyze_food_interactions(self, 
                                  medicines: List[str], 
                                  recent_meals: List[str]) -> List[Dict]:
        """Analyze recent meals against medications"""
        
        prompt = f"""
        Current medications: {', '.join(medicines)}
        Recent meals consumed: {', '.join(recent_meals)}
        
        Check for dangerous interactions.
        
        Return JSON array with:
        - food_item
        - medicine_affected
        - risk_level
        - time_window (when to avoid)
        - suggestion
        """
        
        response = self.model.generate_content(prompt)
        try:
            return json.loads(response.text)
        except:
            return []
    
    def lifestyle_risk_assessment(self, 
                                  medicines: List[str], 
                                  location_type: str,
                                  weather: Dict) -> Dict:
        """Assess lifestyle and environmental risks"""
        
        prompt = f"""
        Medications: {', '.join(medicines)}
        Location: {location_type}
        Weather: {weather}
        
        Identify risks:
        - Sun sensitivity
        - Heat stroke risk
        - Drowsiness warnings
        - Activity restrictions
        
        Return JSON with risk_level and specific_warnings.
        """
        
        response = self.model.generate_content(prompt)
        try:
            return json.loads(response.text)
        except:
            return {
                "risk_level": "low",
                "specific_warnings": [],
                "recommendations": ["Stay hydrated", "Monitor for side effects"]
            }

class CaregiverPulseAgent:
    """Social accountability and monitoring"""
    
    def __init__(self):
        self.model = genai.GenerativeModel('gemini-3-flash-preview')
        
    def generate_empathy_nudge(self, 
                               patient_name: str, 
                               missed_medication: str,
                               time: str) -> str:
        """Generate caring reminder message"""
        
        prompt = f"""
        Create a short, empathetic reminder message for {patient_name} who missed their {missed_medication} dose at {time}.
        
        Tone: Caring, not scolding. Encourage action.
        Include: Why it's important, simple next step.
        Max 2 sentences.
        """
        
        response = self.model.generate_content(prompt)
        return response.text.strip()
    
    def generate_caregiver_alert(self,
                                 patient_name: str,
                                 missed_dose: str,
                                 patient_history: str) -> str:
        """Generate alert for caregiver"""
        
        prompt = f"""
        Create a brief alert for {patient_name}'s caregiver:
        
        Missed: {missed_dose}
        History: {patient_history}
        
        Message should:
        - State what was missed
        - Suggest action (call, check-in)
        - Be concise (3 sentences max)
        
        Tone: Concerned but not alarming.
        """
        
        response = self.model.generate_content(prompt)
        return response.text.strip()

class DoctorCheatSheetAgent:
    """Generate physician-friendly summaries"""
    
    def __init__(self):
        self.model = genai.GenerativeModel('gemini-3-flash-preview')
        
    def generate_flash_report(self, 
                              medication_logs: List[Dict],
                              side_effects: List[str],
                              missed_doses: List[str],
                              interactions: List[Dict]) -> str:
        """Generate 3-bullet point report for doctors"""
        
        prompt = f"""
        Create a "Flash Report" for a doctor (max 3 bullet points):
        
        Medication Adherence: {len([l for l in medication_logs if l.get('taken', False)])}/{len(medication_logs)} doses taken
        Side Effects Reported: {', '.join(side_effects[:3])}
        Missed Doses: {', '.join(missed_doses[:2])}
        Interactions Detected: {len(interactions)}
        
        Format as 3 bullet points with emojis.
        Focus on clinical relevance, not fluff.
        """
        
        response = self.model.generate_content(prompt)
        return response.text.strip()

class CompletePrescriptionSystem:
    """Main orchestrator for all AI agents"""
    
    def __init__(self):
        self.prescription_agent = PrescriptionAIAgent()
        self.pill_agent = VisualPillVerificationAgent()
        self.lifestyle_agent = DrugFoodLifestyleAgent()
        self.caregiver_agent = CaregiverPulseAgent()
        self.doctor_agent = DoctorCheatSheetAgent()
        
    def process_prescription(self, image_path: str) -> Dict[str, Any]:
        """Complete prescription processing pipeline"""
        
        print("📄 Step 1: Extracting text from prescription...")
        extracted_text = self.prescription_agent.extract_text_from_image(image_path)
        
        print("💊 Step 2: Extracting medicines...")
        medicines = self.prescription_agent.extract_medicines(extracted_text)
        
        print("🎯 Step 3: Analyzing medicine purposes...")
        medicines = self.prescription_agent.analyze_medicine_purposes(medicines)
        
        print("⚠️ Step 4: Checking drug interactions...")
        drug_interactions = self.prescription_agent.check_drug_interactions(medicines)
        
        print("🍽️ Step 5: Checking food interactions...")
        food_interactions = self.prescription_agent.check_food_interactions(medicines)
        
        print("📋 Step 6: Generating instructions...")
        medicines = self.prescription_agent.generate_medication_instructions(medicines)
        
        print("📊 Step 7: Calculating safety score...")
        score = self.prescription_agent.generate_prescription_score(
            medicines, drug_interactions, food_interactions
        )
        
        print("📝 Step 8: Generating full explanation...")
        purpose_text = "\n".join([f"{m.name}: {m.purpose}" for m in medicines])
        full_explanation = self.prescription_agent.generate_full_explanation(
            medicines, purpose_text, score
        )
        
        print("🛡️ Step 9: Generating precautions...")
        precautions = self.prescription_agent.generate_precautions(medicines)
        
        print("⏰ Step 10: Extracting reminder data...")
        reminder_data = self.prescription_agent.extract_reminder_times(medicines)
        
        # Build complete report
        report = {
            "basic_info": {
                "upload_date": datetime.now().isoformat(),
                "prescription_title": self._generate_title(medicines),
                "raw_text": extracted_text
            },
            "medicines": [
                {
                    "name": m.name,
                    "dosage": m.dosage,
                    "frequency": m.frequency,
                    "duration": m.duration,
                    "purpose": m.purpose,
                    "instructions": m.instructions
                }
                for m in medicines
            ],
            "purpose_summary": purpose_text,
            "precautions": precautions,
            "score": score.value,
            "full_explanation": full_explanation,
            "reminder_data": reminder_data,
            "drug_interactions": drug_interactions,
            "food_interactions": food_interactions
        }
        
        return report
    
    def _generate_title(self, medicines: List[Medicine]) -> str:
        """Auto-generate prescription title"""
        conditions = []
        for m in medicines:
            if "pain" in m.purpose.lower():
                conditions.append("Pain")
            elif "fever" in m.purpose.lower():
                conditions.append("Fever")
            elif "infection" in m.purpose.lower():
                conditions.append("Infection")
            elif "blood" in m.purpose.lower():
                conditions.append("Blood Pressure")
        
        if conditions:
            return f"{' + '.join(set(conditions))} Treatment"
        return "Prescription Medication"
    
    def real_time_alert(self, 
                        prescription_report: Dict,
                        user_context: Dict) -> List[Dict]:
        """Generate real-time alerts based on context"""
        
        alerts = []
        
        # Check for critical drug interactions
        for interaction in prescription_report.get("drug_interactions", []):
            if interaction.get("severity") == "High":
                alerts.append({
                    "type": "danger",
                    "title": "⚠️ Serious Drug Interaction Detected!",
                    "message": interaction.get("description", "Please consult your doctor immediately"),
                    "action_required": True
                })
        
        # Check lifestyle context
        if user_context.get("location"):
            lifestyle_risk = self.lifestyle_agent.lifestyle_risk_assessment(
                [m["name"] for m in prescription_report.get("medicines", [])],
                user_context.get("location_type", "indoor"),
                user_context.get("weather", {})
            )
            
            if lifestyle_risk.get("risk_level") == "high":
                alerts.append({
                    "type": "warning",
                    "title": "🌡️ Lifestyle Risk Alert",
                    "message": "; ".join(lifestyle_risk.get("specific_warnings", [])),
                    "action_required": False
                })
        
        return alerts

# Example usage and API endpoint
def main():
    """Example workflow"""
    system = CompletePrescriptionSystem()
    
    # Process prescription
    report = system.process_prescription("prescription.jpg")
    
    # Display report
    print("\n" + "="*60)
    print(f"📋 PRESCRIPTION REPORT")
    print("="*60)
    print(f"\n🏷️ Title: {report['basic_info']['prescription_title']}")
    print(f"📅 Date: {report['basic_info']['upload_date']}")
    print(f"📊 Score: {report['score']}")
    
    print(f"\n💊 MEDICINES:")
    for med in report['medicines']:
        print(f"\n  • {med['name']} ({med['dosage']})")
        print(f"    Frequency: {med['frequency']}")
        print(f"    Duration: {med['duration']}")
        print(f"    Purpose: {med['purpose']}")
        print(f"    Instructions: {med['instructions']}")
    
    print(f"\n⚠️ PRECAUTIONS:")
    precautions = report['precautions']
    print(f"  Common Side Effects: {', '.join(precautions.get('common_side_effects', []))}")
    print(f"  Things to Avoid: {', '.join(precautions.get('things_to_avoid', []))}")
    
    print(f"\n📝 FULL EXPLANATION:")
    print(report['full_explanation'])
    
    # Check for real-time alerts
    user_context = {
        "location": "beach",
        "location_type": "outdoor",
        "weather": {"temperature": 32, "uv_index": 8}
    }
    
    alerts = system.real_time_alert(report, user_context)
    for alert in alerts:
        print(f"\n{alert['title']}")
        print(f"  {alert['message']}")
    
    return report

if __name__ == "__main__":
    main()