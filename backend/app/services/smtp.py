import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def send_email(to_email: str, download_url: str, filename: str):
    from_email = os.getenv("EMAIL_ADDRESS")
    from_password = os.getenv("EMAIL_PASSWORD")
    
    if not from_email or not from_password:
        logger.error("Missing EMAIL_ADDRESS or EMAIL_PASSWORD environment variables")
        return False
    
    subject = "Your Redacted File is Ready"
    html = f"""
<html>
  <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
      <h2 style="color: #e07b00;">Your Redacted File is Ready</h2>
      <p style="font-size: 16px; color: #333;">
        Hi there,
      </p>
      <p style="font-size: 16px; color: #333;">
        We've finished redacting your file: <strong>{filename}</strong>.
      </p>
      <p style="margin: 30px 0;">
        <a href="{download_url}" style="background-color: #e07b00; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
          Download Redacted PDF
        </a>
      </p>

      <p style="font-size: 16px; color: #999; margin-top: 30px;">
        — The Redax Team
      </p>
    </div>
  </body>
</html>
"""


    msg = MIMEMultipart("alternative")
    msg["From"] = from_email
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(html, "html"))

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(from_email, from_password)
            server.sendmail(from_email, to_email, msg.as_string())   
            return True         
    except Exception as e:
        logger.error("Failed to send email: %s", str(e))
        return False