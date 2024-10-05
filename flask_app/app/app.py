from flask import Flask, render_template, redirect, url_for, request, jsonify, abort
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from apscheduler.schedulers.background import BackgroundScheduler
from config import Config  # Correct import of Config
from tasks import notify_user
from util import get_landsat_overpasses, send_sms
import datetime
from models import db, User, SatellitePass
from flask import Flask
from util import init_earth_engine  # Import your init function
from flask_mail import Mail, Message
from dotenv import load_dotenv
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_apscheduler import APScheduler
from config import Config
import ee

# Initialize the database and scheduler
db = SQLAlchemy()
scheduler = APScheduler()
load_dotenv()
mail = Mail()

def create_app():
    app = Flask(__name__)
    app.config.from_object('config.Config')

    # Initialize Earth Engine
    init_earth_engine()

    # Initialize the database with the app
    db.init_app(app)
    mail.init_app(app)  # Initialize Flask-Mail

    login_manager = LoginManager()
    login_manager.init_app(app)

    # scheduler = BackgroundScheduler()  # No need to bind scheduler with app
    # scheduler.start()
    # Initialize the scheduler
    scheduler.init_app(app)
    # scheduler.start()

    return app, scheduler


# Updated send_email function with Flask-Mail
def send_email(to_email, subject, body):
    msg = Message(subject, sender=Config.MAIL_USERNAME, recipients=[to_email])  # Sender is now from Config.MAIL_USERNAME
    msg.body = body
    mail.send(msg)


def render_login_template():
    return render_template('login.html')


def render_index_template():
    return render_template('index.html')


def render_dashboard_template():
    return render_template('dashboard.html')


def handle_login():
    email = request.form['email']
    password = request.form['password']
    user = User.query.filter_by(email=email).first()
    if user and check_password_hash(user.password, password):
        login_user(user)
        return redirect(url_for('dashboard'))
    return "Invalid credentials"


def handle_registration():
    email = request.form['email']
    password = request.form['password']
    hashed_password = generate_password_hash(password, method='sha256')
    new_user = User(email=email, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    login_user(new_user)
    return redirect(url_for('dashboard'))


app, scheduler = create_app()


@app.route('/')
def index():
    return render_index_template()


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        return handle_login()
    return render_login_template()


@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        return handle_registration()
    return render_template('register.html')


@app.route('/dashboard')
@login_required
def dashboard():
    return render_dashboard_template()


@app.route('/search', methods=['POST'])
@login_required
def search():
    latitude = float(request.form['latitude'])  # Get latitude from the form data
    longitude = float(request.form['longitude'])  # Get longitude from the form data
    date = request.form['date']  # Get date from the form data

    # Query Landsat overpasses using Earth Engine
    overpasses = get_landsat_overpasses(latitude, longitude, date)

    # Return the overpass metadata as JSON
    return jsonify(overpasses)


@app.route('/schedule', methods=['POST'])
@login_required
def schedule_notification():
    user_id = current_user.id
    satellite = request.form['satellite']
    notify_time = request.form['notify_time']

    # Ensure notify_time is in valid datetime format
    try:
        notify_time = datetime.datetime.strptime(notify_time, '%Y-%m-%d %H:%M:%S')
    except ValueError:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD HH:MM:SS"}), 400

    scheduler.add_job(func=notify_user, trigger='date', run_date=notify_time, args=[user_id, satellite])
    return jsonify({"message": "Notification scheduled!"})



if __name__ == '__main__':
    app, scheduler = create_app()

    # Create the database tables if they do not exist
    with app.app_context():
        db.create_all()

    # Run the app
    app.run(debug=True)