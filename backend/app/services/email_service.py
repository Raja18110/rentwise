import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

load_dotenv()

# Email configuration
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SENDER_EMAIL = os.getenv("SENDER_EMAIL", "your_email@gmail.com")
SENDER_PASSWORD = os.getenv("SENDER_PASSWORD", "your_app_password")


def send_otp_email(recipient_email: str, otp: str) -> bool:
    """
    Send OTP to user's email
    
    Args:
        recipient_email: Recipient's email address
        otp: OTP to send
        
    Returns:
        True if email sent successfully, False otherwise
    """
    try:
        # Create message
        message = MIMEMultipart("alternative")
        message["Subject"] = "Your RentWise OTP Verification Code"
        message["From"] = SENDER_EMAIL
        message["To"] = recipient_email

        # HTML version of the email
        html = f"""\
        <html>
          <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-bottom: 20px;">RentWise Verification</h2>
              <p style="color: #666; font-size: 16px; margin-bottom: 20px;">
                Your OTP verification code is:
              </p>
              <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
                <p style="font-size: 32px; color: #2563eb; font-weight: bold; margin: 0; letter-spacing: 5px;">
                  {otp}
                </p>
              </div>
              <p style="color: #666; font-size: 14px; margin-top: 20px;">
                This code will expire in 5 minutes. Do not share this code with anyone.
              </p>
              <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
                If you didn't request this code, please ignore this email.
              </p>
            </div>
          </body>
        </html>
        """

        # Plain text version
        text = f"Your RentWise OTP is: {otp}\n\nThis code will expire in 5 minutes."

        # Attach both versions
        part1 = MIMEText(text, "plain")
        part2 = MIMEText(html, "html")
        message.attach(part1)
        message.attach(part2)

        # Send email
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.sendmail(SENDER_EMAIL, recipient_email, message.as_string())

        print(f"✅ OTP email sent to {recipient_email}")
        return True

    except smtplib.SMTPAuthenticationError:
        print("❌ SMTP Authentication failed. Check your email credentials.")
        return False
    except smtplib.SMTPException as e:
        print(f"❌ SMTP error: {str(e)}")
        return False
    except Exception as e:
        print(f"❌ Error sending email: {str(e)}")
        return False


def send_notification_email(recipient_email: str, subject: str, message_text: str, message_html: str = None) -> bool:
    """
    Send a notification email
    
    Args:
        recipient_email: Recipient's email address
        subject: Email subject
        message_text: Plain text version
        message_html: HTML version (optional)
        
    Returns:
        True if email sent successfully, False otherwise
    """
    try:
        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = SENDER_EMAIL
        message["To"] = recipient_email

        part1 = MIMEText(message_text, "plain")
        message.attach(part1)

        if message_html:
            part2 = MIMEText(message_html, "html")
            message.attach(part2)

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.sendmail(SENDER_EMAIL, recipient_email, message.as_string())

        print(f"✅ Email sent to {recipient_email}")
        return True

    except Exception as e:
        print(f"❌ Error sending email: {str(e)}")
        return False
