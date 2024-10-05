import ee
import smtplib
from email.mime.text import MIMEText
from config import Config

# Initialize Google Earth Engine with Service Account Credentials
def init_earth_engine():
    try:
        credentials = ee.ServiceAccountCredentials(Config.GEE_SERVICE_ACCOUNT_EMAIL, Config.GEE_SERVICE_ACCOUNT_KEY)
        ee.Initialize(credentials)
        print("Google Earth Engine initialized successfully.")
    except Exception as e:
        print(f"Failed to initialize Google Earth Engine: {e}")


# Fetch real-time Landsat overpasses using Google Earth Engine
def get_landsat_overpasses(latitude, longitude, date):
    try:
        # Define the point of interest
        point = ee.Geometry.Point([longitude, latitude])

        # Specify the Landsat-8 image collection
        collection = ee.ImageCollection('LANDSAT/LC08/C01/T1_SR') \
                        .filterBounds(point) \
                        .filterDate(ee.Date(date), ee.Date(date).advance(1, 'day')) \
                        .sort('CLOUD_COVER')

        # Get list of overpasses
        overpasses = collection.getInfo()

        # Extract overpass times and return them
        result = []
        for image in overpasses['features']:
            pass_time = image['properties']['system:time_start']
            result.append({
                "satellite": "Landsat-8",
                "overpass_time": pass_time
            })

        return {"overpasses": result}
    except Exception as e:
        print(f"Failed to retrieve Landsat overpasses: {e}")
        return {"overpasses": []}

# Send Email
def send_email(to_email, subject, body):
    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = Config.EMAIL_ADDRESS
    msg["To"] = to_email

    try:
        with smtplib.SMTP(Config.SMTP_SERVER, Config.SMTP_PORT) as server:
            server.login(Config.EMAIL_ADDRESS, Config.EMAIL_PASSWORD)
            server.sendmail(Config.EMAIL_ADDRESS, to_email, msg.as_string())
        print(f"Email sent to {to_email}")
    except Exception as e:
        print(f"Failed to send email: {e}")

# Mock SMS
def send_sms(to_phone, message):
    print(f"Mock SMS sent to {to_phone}: {message}")