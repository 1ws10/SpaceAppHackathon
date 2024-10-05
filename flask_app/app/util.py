import ee
import os
import smtplib
from email.mime.text import MIMEText
from twilio.rest import Client
from config import Config


# Initialize Earth Engine
def init_earth_engine():
    # Load service account details from environment variables
    service_account_email = os.environ.get('GEE_SERVICE_ACCOUNT')
    service_account_key = os.environ.get('AIzaSyCb98Lo-mr3fXMxUfVGbp_xyDU4DvV8ar4')

    # Initialize Earth Engine using service account credentials
    credentials = ee.ServiceAccountCredentials(service_account_email, service_account_key)
    ee.Initialize(credentials)

# Get Landsat Overpasses using GEE
def get_landsat_overpasses(latitude, longitude, date):
    point = ee.Geometry.Point(longitude, latitude)  # Define the geographic point
    collection = ee.ImageCollection("LANDSAT/LC08/C01/T1_SR")  # Specify Landsat 8 SR collection
    collection = collection.filterBounds(point)  # Filter by location
    collection = collection.filterDate(date)  # Filter by date

    overpasses = collection.getInfo()  # Fetch metadata about the images
    return overpasses

# Send Email
def send_email(to_email, subject, body):
    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = Config.EMAIL_ADDRESS
    msg["To"] = to_email

    with smtplib.SMTP(Config.SMTP_SERVER, Config.SMTP_PORT) as server:
        server.starttls()
        server.login(Config.EMAIL_ADDRESS, Config.EMAIL_PASSWORD)
        server.sendmail(Config.EMAIL_ADDRESS, to_email, msg.as_string())

# Send SMS
def send_sms(to_phone, message):
    client = Client(Config.TWILIO_ACCOUNT_SID, Config.TWILIO_AUTH_TOKEN)
    client.messages.create(
        body=message,
        from_=Config.TWILIO_PHONE_NUMBER,
        to=to_phone
    )