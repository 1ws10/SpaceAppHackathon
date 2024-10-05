from twilio.rest import Client
#from flask import current_app
from models import User, db

from util import send_email, send_sms


def notify_user(user_id, satellite):
    user = User.query.get(user_id)
    if not user:
        print(f"User with ID {user_id} not found.")
        return

    message = f"Satellite {satellite} will be overhead at your location soon!"

    try:
        send_email(user.email, "Satellite Notification", message)
    except Exception as e:
        print(f"Failed to send email to {user.email}: {e}")

    try:
        send_sms(user.phone, message)
    except Exception as e:
        print(f"Failed to send SMS to {user.phone}: {e}")

    print(f"Notification sent to {user.email if user.email else user.phone}")