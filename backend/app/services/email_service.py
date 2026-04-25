import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from dotenv import load_dotenv


load_dotenv()

SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SENDER_EMAIL = (
    os.getenv("SENDER_EMAIL")
    or os.getenv("SMTP_USERNAME")
    or os.getenv("GMAIL_EMAIL")
    or os.getenv("EMAIL_USER")
)
SENDER_PASSWORD = (
    os.getenv("SENDER_PASSWORD")
    or os.getenv("SMTP_PASSWORD")
    or os.getenv("GMAIL_APP_PASSWORD")
    or os.getenv("EMAIL_PASSWORD")
)


def _email_configured() -> bool:
    return bool(SENDER_EMAIL and SENDER_PASSWORD)


def _send_email(recipient_email: str, subject: str, text: str, html: str | None = None) -> bool:
    if not _email_configured():
        print("Email is not configured. Set SENDER_EMAIL and SENDER_PASSWORD.")
        return False

    message = MIMEMultipart("alternative")
    message["Subject"] = subject
    message["From"] = SENDER_EMAIL
    message["To"] = recipient_email
    message.attach(MIMEText(text, "plain"))

    if html:
        message.attach(MIMEText(html, "html"))

    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT, timeout=20) as server:
            server.starttls()
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.sendmail(SENDER_EMAIL, recipient_email, message.as_string())

        print(f"Email sent to {recipient_email}")
        return True
    except smtplib.SMTPAuthenticationError:
        print("SMTP authentication failed. Use a Gmail App Password, not the Gmail login password.")
        return False
    except smtplib.SMTPException as exc:
        print(f"SMTP error: {str(exc)}")
        return False
    except Exception as exc:
        print(f"Error sending email: {str(exc)}")
        return False


def send_otp_email(recipient_email: str, otp: str) -> bool:
    html = f"""
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
          <h2 style="color: #333;">RentWise Verification</h2>
          <p style="color: #666; font-size: 16px;">Your OTP verification code is:</p>
          <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; text-align: center;">
            <p style="font-size: 32px; color: #2563eb; font-weight: bold; margin: 0; letter-spacing: 5px;">{otp}</p>
          </div>
          <p style="color: #666; font-size: 14px;">This code will expire in 5 minutes. Do not share this code.</p>
        </div>
      </body>
    </html>
    """
    text = f"Your RentWise OTP is: {otp}\n\nThis code will expire in 5 minutes."
    return _send_email(recipient_email, "Your RentWise OTP Verification Code", text, html)


def send_notification_email(
    recipient_email: str,
    subject: str,
    message_text: str,
    message_html: str | None = None,
) -> bool:
    return _send_email(recipient_email, subject, message_text, message_html)
