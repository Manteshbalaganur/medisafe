# firebase_storage.py

import firebase_admin
from firebase_admin import credentials, firestore, storage
from datetime import datetime
import json

class FirebasePrescriptionStorage:
    """Handle Firebase storage for prescriptions"""
    
    def __init__(self, credentials_path: str):
        # Initialize Firebase
        cred = credentials.Certificate(credentials_path)
        firebase_admin.initialize_app(cred, {
            'storageBucket': 'your-bucket-name.appspot.com'
        })
        
        self.db = firestore.client()
        self.bucket = storage.bucket()
    
    def save_prescription(self, user_id: str, prescription_data: dict) -> str:
        """Save complete prescription report to Firestore"""
        
        doc_ref = self.db.collection('users').document(user_id)\
                      .collection('prescriptions').document()
        
        prescription_data['stored_at'] = datetime.now().isoformat()
        prescription_data['user_id'] = user_id
        
        doc_ref.set(prescription_data)
        
        return doc_ref.id
    
    def get_prescription(self, user_id: str, prescription_id: str) -> dict:
        """Retrieve prescription by ID"""
        
        doc_ref = self.db.collection('users').document(user_id)\
                      .collection('prescriptions').document(prescription_id)
        
        doc = doc_ref.get()
        if doc.exists:
            return doc.to_dict()
        return None
    
    def get_all_prescriptions(self, user_id: str) -> list:
        """Get all prescriptions for dashboard"""
        
        prescriptions_ref = self.db.collection('users').document(user_id)\
                                 .collection('prescriptions')\
                                 .order_by('stored_at', direction=firestore.Query.DESCENDING)
        
        docs = prescriptions_ref.stream()
        
        return [
            {
                'id': doc.id,
                **doc.to_dict()
            }
            for doc in docs
        ]
    
    def save_pill_verification(self, user_id: str, pill_data: dict) -> str:
        """Store pill verification results"""
        
        doc_ref = self.db.collection('users').document(user_id)\
                      .collection('pill_verifications').document()
        
        pill_data['timestamp'] = datetime.now().isoformat()
        doc_ref.set(pill_data)
        
        return doc_ref.id
    
    def log_medication_taken(self, user_id: str, prescription_id: str, 
                            medicine_name: str, timestamp: str):
        """Log when patient takes medication"""
        
        log_ref = self.db.collection('users').document(user_id)\
                        .collection('medication_logs').document()
        
        log_ref.set({
            'prescription_id': prescription_id,
            'medicine_name': medicine_name,
            'taken_at': timestamp,
            'confirmed': True
        })
        
        return log_ref.id
    
    def get_missed_doses(self, user_id: str, prescription_id: str) -> list:
        """Identify missed doses based on schedule"""
        
        # Get prescription
        prescription = self.get_prescription(user_id, prescription_id)
        if not prescription:
            return []
        
        # Get logs from last 24 hours
        from datetime import timedelta
        yesterday = datetime.now() - timedelta(days=1)
        
        logs_ref = self.db.collection('users').document(user_id)\
                        .collection('medication_logs')\
                        .where('prescription_id', '==', prescription_id)\
                        .where('taken_at', '>=', yesterday.isoformat())
        
        logs = list(logs_ref.stream())
        taken_medicines = [log.to_dict().get('medicine_name') for log in logs]
        
        # Compare with expected medicines
        expected_medicines = [m['name'] for m in prescription.get('medicines', [])]
        missed = [m for m in expected_medicines if m not in taken_medicines]
        
        return missed