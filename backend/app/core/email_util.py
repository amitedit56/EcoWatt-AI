import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

SMTP_EMAIL = os.getenv("SMTP_EMAIL")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 587

# Where the reset link in the email should point the user to (your frontend).
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


def send_password_reset_email(to_email: str, reset_token: str):
    """Sends a password reset email with a link containing the reset token.
    Raises an exception if SMTP isn't configured or sending fails — the
    calling endpoint decides how to surface that to the user."""
    if not SMTP_EMAIL or not SMTP_PASSWORD:
        raise RuntimeError(
            "SMTP_EMAIL / SMTP_PASSWORD not set in backend/.env — "
            "cannot send password reset emails."
        )

    reset_link = f"{FRONTEND_URL}/reset-password/{reset_token}"

    subject = "Reset your EcoWatt AI password"
    body = f"""\
Hi,

We received a request to reset your EcoWatt AI account password.

Click the link below to set a new password. This link is valid for 30 minutes:

{reset_link}

If you didn't request this, you can safely ignore this email — your password
will remain unchanged.

— EcoWatt AI
"""

    msg = MIMEMultipart()
    msg["From"] = SMTP_EMAIL
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_EMAIL, SMTP_PASSWORD)
        server.sendmail(SMTP_EMAIL, to_email, msg.as_string())