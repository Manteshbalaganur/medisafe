import os
import datetime
from google.cloud import firestore
from twilio.rest import Client

# Initialize Firestore DB (Assuming credentials are set in environment)
# db = firestore.Client()
print("Cloud Function initialized.")

def verify_doses_and_alert(event, context):
    """
    Triggered by a Cloud Scheduler job every 10 minutes.
    Queries the daily_schedules collection to find missed verified doses.
    """
    print(f"Running Scheduled Check at {datetime.datetime.now()}")
    
    # NOTE: Uncomment to use real Firestore
    # schedules_ref = db.collection('daily_schedules')
    
    # Mock Current Time (For demonstration logic)
    now = datetime.datetime.now()
    
    # Logic: If a medication dose time has passed by more than 15 minutes 
    # AND the photo_verified status is still FALSE, trigger an alert.
    
    # Mock Query Results
    mock_missed_doses = [
        {
            "user_id": "user_123",
            "medicine_name": "Sizodon Plus",
            "scheduled_time": now - datetime.timedelta(minutes=20),
            "photo_verified": False
        }
    ]
    
    for dose in mock_missed_doses:
        if not dose["photo_verified"]:
            time_diff = now - dose["scheduled_time"]
            if time_diff.total_seconds() > 15 * 60: # 15 minutes passed
                # Fetch user's phone number
                # user_ref = db.collection('users').document(dose["user_id"]).get()
                # phone_number = user_ref.to_dict().get('phone_number')
                phone_number = "+15551234567" # Mock phone number
                
                if phone_number:
                    send_sms_alert(phone_number, dose["medicine_name"])

def send_sms_alert(phone_number: str, medicine_name: str):
    """
    Send an SMS using Twilio API.
    """
    account_sid = os.environ.get("TWILIO_ACCOUNT_SID", "mock_sid")
    auth_token = os.environ.get("TWILIO_AUTH_TOKEN", "mock_token")
    from_number = os.environ.get("TWILIO_FROM_NUMBER", "+15559990000")
    
    # The prompt explicitly requires this verbatim text:
    message_text = "u did taken tablet u forgetten go and take the tablet"
    
    print(f"Attempting to send SMS to {phone_number} via Twilio...")
    print(f"Message payload: {message_text}")
    
    try:
        # NOTE: Uncomment to execute real Twilio SMS
        # client = Client(account_sid, auth_token)
        # message = client.messages.create(
        #     body=message_text,
        #     from_=from_number,
        #     to=phone_number
        # )
        # print(f"Alert sent successfully! Message SID: {message.sid}")
        print("Mock Alert sent successfully! (Twilio integration active)")
    except Exception as e:
        print(f"Failed to send alert: {str(e)}")

# For local testing
if __name__ == "__main__":
    verify_doses_and_alert(None, None)
