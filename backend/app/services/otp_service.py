import random
import time
from app.services.email_service import send_otp_email

# Store OTP with expiry (in-memory cache, use Redis for production)
store = {}


def generate_otp(email: str) -> dict:
    """
    Generate OTP and send to email
    
    Args:
        email: User's email address
        
    Returns:
        Dictionary with success status and message
    """
    try:
        # Generate 6-digit OTP
        otp = str(random.randint(100000, 999999))
        
        # Store OTP with 5 minute expiry (300 seconds)
        store[email] = {
            "otp": otp,
            "exp": time.time() + 300
        }
        
        # Send OTP via email
        if send_otp_email(email, otp):
            return {
                "success": True,
                "message": f"OTP sent to {email}"
            }
        else:
            # Remove failed OTP from store
            store.pop(email, None)
            return {
                "success": False,
                "message": "Failed to send OTP email. Please try again."
            }
            
    except Exception as e:
        print(f"❌ OTP generation error: {str(e)}")
        return {
            "success": False,
            "message": "Error generating OTP"
        }


def verify_otp(email: str, otp: str) -> bool:
    """
    Verify OTP for given email
    
    Args:
        email: User's email address
        otp: OTP to verify
        
    Returns:
        True if OTP is valid and not expired, False otherwise
    """
    try:
        otp_data = store.get(email)
        
        if not otp_data:
            return False
            
        # Check if OTP matches and hasn't expired
        is_valid = otp_data["otp"] == otp and time.time() < otp_data["exp"]
        
        # Clean up used OTP
        if is_valid:
            store.pop(email, None)
            
        return is_valid
        
    except Exception as e:
        print(f"❌ OTP verification error: {str(e)}")
        return False