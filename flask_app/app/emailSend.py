from flask import current_app
from flask_mail import Mail, Message
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime


def send_email(app, to, subject, body, mail):
    with app.app_context():  # Ensure the Flask app context is active
        msg = Message(subject, recipients=[to])
        msg.body = body
        mail.send(msg)

def schedule_email(app, to, subject, body, send_time, scheduler, mail):
    scheduler.add_job(func=send_email, trigger='date', run_date=send_time, args=[app, to, subject, body, mail])
