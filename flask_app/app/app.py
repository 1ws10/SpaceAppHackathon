from flask import Flask, send_from_directory, request, jsonify, redirect, url_for
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from apscheduler.schedulers.background import BackgroundScheduler
from config import Config
from tasks import notify_user
from util import get_landsat_overpasses, send_sms, init_earth_engine
from flask_mail import Mail, Message
from dotenv import load_dotenv
from flask_sqlalchemy import SQLAlchemy
from flask_apscheduler import APScheduler
import datetime
import os

# Initialize the database and scheduler
db = SQLAlchemy()
scheduler = APScheduler()
load_dotenv()
mail = Mail()

def create_app():
    app = Flask(__name__, static_folder='../../frontend/build', static_url_path='/')

    app.config.from_object('config.Config')

    # Initialize Earth Engine
    init_earth_engine()

    # Initialize the database with the app
    db.init_app(app)
    mail.init_app(app)  # Initialize Flask-Mail

    login_manager = LoginManager()
    login_manager.init_app(app)

    # Initialize the scheduler
    scheduler.init_app(app)
    
    # Flask API Routes
    @app.route('/login', methods=['POST'])
    def login():
        email = request.form['email']
        password = request.form['password']
        user = User.query.filter_by(email=email).first()
        if user and check_password_hash(user.password, password):
            login_user(user)
            return redirect(url_for('dashboard'))
        return jsonify({"message": "Invalid credentials"}), 401

    @app.route('/register', methods=['POST'])
    def register():
        email = request.form['email']
        password = request.form['password']
        hashed_password = generate_password_hash(password, method='sha256')
        new_user = User(email=email, password=hashed_password)
        db.session.add(new_user)
        db.session.commit()
        login_user(new_user)
        return jsonify({"message": "User registered successfully!"})

    @app.route('/dashboard')
    @login_required
    def dashboard():
        return jsonify({"message": "Welcome to the dashboard!"})

    @app.route('/search', methods=['POST'])
    @login_required
    def search():
        latitude = float(request.form['latitude'])
        longitude = float(request.form['longitude'])
        date = request.form['date']

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

    # Serve React App
    @app.route('/')
    @app.route('/<path:path>', methods=['GET'])
    def serve_react_app(path=None):
        # Get the absolute path to the build directory
        build_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../frontend/build'))
        print("build directory: " + build_dir)

        # Check if the requested file exists in the build directory
        if path and os.path.exists(os.path.join(build_dir, path)):
            return send_from_directory(build_dir, path)

        # If the file doesn't exist, serve index.html to allow React to handle routing
        return send_from_directory(build_dir, 'index.html')

    return app, scheduler

# Main block to start the app
if __name__ == '__main__':
    app, scheduler = create_app()

    # Create the database tables if they do not exist
    with app.app_context():
        db.create_all()

    # Run the app
    app.run(debug=True)
