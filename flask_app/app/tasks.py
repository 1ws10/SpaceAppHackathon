from models import User, db
from util import send_email, send_sms, get_landsat_overpasses
from datetime import datetime


def notify_user(user_id, latitude, longitude):
    user = User.query.get(user_id)
    if not user:
        print(f"User with ID {user_id} not found.")
        return

    # Get current date in YYYY-MM-DD format
    today = datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d")

    # Fetch Landsat overpass data for the user's location
    overpasses = get_landsat_overpasses(latitude, longitude, today)

    if not overpasses["overpasses"]:
        print(f"No satellite overpasses found for user {user_id} on {today}.")
        return

    # Notify user about the upcoming satellite pass
    for pass_info in overpasses["overpasses"]:
        satellite = pass_info["satellite"]
        overpass_time = datetime.utcfromtimestamp(
            pass_info["overpass_time"] / 1000
        ).strftime("%Y-%m-%d %H:%M:%S")

        message = f"Satellite {satellite} will pass over your location on {overpass_time} UTC."

        try:
            send_email(user.email, "Satellite Notification", message)
        except Exception as e:
            print(f"Failed to send email to {user.email}: {e}")

        try:
            send_sms(user.phone, message)
        except Exception as e:
            print(f"Failed to send SMS to {user.phone}: {e}")

        print(
            f"Notification sent to {user.email if user.email else user.phone} about {satellite} at {overpass_time}"
        )
