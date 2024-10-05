import os

class Config:
    EMAIL_ADDRESS = os.getenv('EMAIL_ADDRESS', "your_email@example.com")
    EMAIL_PASSWORD = os.getenv('EMAIL_PASSWORD', "your_password")
    SMTP_SERVER = os.getenv('SMTP_SERVER', "smtp.example.com")
    SMTP_PORT = os.getenv('SMTP_PORT', 587)

    # Twilio settings (if needed)
    TWILIO_ACCOUNT_SID = os.getenv('TWILIO_ACCOUNT_SID')
    TWILIO_AUTH_TOKEN = os.getenv('TWILIO_AUTH_TOKEN')
    TWILIO_PHONE_NUMBER = os.getenv('TWILIO_PHONE_NUMBER')

    # Google Earth Engine Service Account Credentials
    GEE_SERVICE_ACCOUNT_KEY = "path_to_your-private-key.json"
    GEE_SERVICE_ACCOUNT_EMAIL = os.getenv('GEE_SERVICE_ACCOUNT_EMAIL', "your_service_account_email")
    GEE_SERVICE_ACCOUNT_KEY = os.getenv('GEE_SERVICE_ACCOUNT_KEY', "ca2rcnasaapps-8f08cba490d7.json")

    # SQLAlchemy settings
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///app.db')  # Default is SQLite DB
    SQLALCHEMY_TRACK_MODIFICATIONS = False  # To suppress SQLAlchemy modification tracking warnings


