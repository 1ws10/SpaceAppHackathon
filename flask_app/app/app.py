from flask import Flask, send_from_directory, request, jsonify, redirect, url_for
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from apscheduler.schedulers.background import BackgroundScheduler
from config import Config
from tasks import notify_user
from util import get_landsat_overpasses, send_sms#, init_earth_engine
from flask_mail import Mail, Message
from dotenv import load_dotenv
from flask_sqlalchemy import SQLAlchemy
from flask_apscheduler import APScheduler
import datetime
import os
import ee
import authentication
import sqlite3
from apscheduler.schedulers.background import BackgroundScheduler
import atexit
from datetime import datetime
import emailSend


# Initialize the database and scheduler
db = SQLAlchemy()
scheduler = APScheduler()
load_dotenv()

# Initialize Google Earth Engine with Service Account Credentials
def init_earth_engine():
    try:
        credentials = ee.ServiceAccountCredentials(
            Config.GEE_SERVICE_ACCOUNT_EMAIL, Config.GEE_SERVICE_ACCOUNT_KEY_FILE_PATH
        )
        ee.Initialize(credentials)
        print("Google Earth Engine initialized successfully.")
    except Exception as e:
        print(f"Failed to initialize Google Earth Engine: {e}")



def create_app():
    app = Flask(__name__, static_folder='../../frontend/build', static_url_path='/')

    app.config.from_object('config.Config')
    app.config['MAIL_SERVER'] = 'smtp.outlook.com'
    app.config['MAIL_PORT'] = 587
    app.config['MAIL_USE_TLS'] = True
    app.config['MAIL_USE_SSL'] = False
    app.config['MAIL_USERNAME'] = 'spaceapp1232024@outlook.com'
    app.config['MAIL_PASSWORD'] = 'MyPassword123' #MyPassword123
    app.config['MAIL_DEFAULT_SENDER'] = 'spaceapp1232024@outlook.com'
    mail = Mail(app)

    # Initialize Earth Engine
    init_earth_engine()

    # Initialize the database with the app
    db.init_app(app)
    # mail.init_app(app)  # Initialize Flask-Mail

    login_manager = LoginManager()
    login_manager.init_app(app)

    # Initialize the scheduler
    # scheduler.init_app(app)
    
    scheduler = BackgroundScheduler()
    scheduler.start()
    
    # Flask API Routes
    
    @app.route('/schedule-email', methods=['POST'])
    def schedule_email_route():
        email = request.form['email']
        subject = request.form['subject']
        body = request.form['body']
        send_time = request.form['send_time']
        
        print(f"Received send_time: {send_time}")  # Log the received time for debugging
        print(email, subject, body)
        
        try:
            # send_time = datetime.fromisoformat(send_time)
            # emailSend.schedule_email(app, email, subject, body, send_time, scheduler, mail)
            # emailSend.send_email(app, email, subject, body, mail)
            msg = Message(subject, sender = "spaceapp2024@gmail.com", recipients = email, )
            msg.body = body
            mail.send(msg)
            return jsonify({'message': f'Email scheduled to be sent at {send_time}'}), 200
        except ValueError as e:
            return jsonify({'message': f'{e}'}), 400


    @app.route('/login', methods=['POST'])
    def login():
        email = request.form['email']
        password = request.form['password']
        loggedIn = authentication.login(email, password)
        if not loggedIn:
            return jsonify({'message': 'Invalid email or password.'}), 401
        return jsonify({'message': 'Login successful!'}), 200

    @app.route('/register', methods=['POST'])
    def register():
        email = request.form['email']
        password = request.form['password']
        try:
            authentication.createLogin(email, password)
            return jsonify({"message": "User registered successfully!"})
        except sqlite3.IntegrityError as e:
            return jsonify({"message: User registration unsuccessful"}, 401)
        return
        

    @app.route('/dashboard')
    @login_required
    def dashboard():
        return jsonify({"message": "Welcome to the dashboard!"})

    @app.route('/search', methods=['POST'])
    def search():
        latitude = float(request.form['latitude'])
        longitude = float(request.form['longitude'])
        date = request.form['date']

        # Query Landsat overpasses using Earth Engine
        overpasses = get_landsat_overpasses(latitude, longitude, date)

        # Return the overpass metadata as JSON
        return jsonify(overpasses)
    
    @app.route('/search-data', methods=['GET'])
    def search_data():
        # Extract query parameters
        latitude = request.args.get('latitude', type=float)
        longitude = request.args.get('longitude', type=float)
        start_date = request.args.get('startDate')
        end_date = request.args.get('endDate')
        cloud_coverage = request.args.get('cloudCoverage', type=int)

        point = ee.Geometry.Point([longitude, latitude])


        # Filter the Landsat 9 image collection
        # collection = ee.ImageCollection('LANDSAT/LC09/C02/T1_L2') \
        #     .filterDate(start_date, end_date) \
        #     .filterBounds(point) \
        #     .filter(ee.Filter.lt('CLOUD_COVER', cloud_coverage))
        landsat_sr = ee.ImageCollection('LANDSAT/LC09/C02/T1_L2') \
                .filterBounds(point) \
                .filterDate(start_date, end_date) \
                .filter(ee.Filter.lt('CLOUD_COVER', 10))

        # Get the first image from the collection
        # image = collection.first()
        image = landsat_sr.first()
        # Check if an image exists
        if image.getInfo() is None:
            return jsonify({'error': 'No images found for the given parameters.'}), 404

        # Get the pixel value at the point
        selected_pixel = image.sample(point, scale=30).first().toDictionary().getInfo()

        # Get surrounding pixels (e.g., a 3x3 window around the point)
        neighborhood = image.neighborhoodToArray(ee.Kernel.square(1))
        neighborhood_values = neighborhood.sample(point, scale=30).first().toDictionary().getInfo()

        # Return the pixel data
        return jsonify({
            'selectedPixel': selected_pixel,
            'surroundingPixels': neighborhood_values
        })
    
        

    @app.route('/api/get-landsat-data', methods=['POST'])
    def get_landsat_data():

        # Access JSON data from the request
        # data = request.json

        # latitude = float(data['latitude'])
        # longitude = float(data['longitude'])
        # start_date = data['startDate']
        # end_date = data['endDate']
        # cloud_coverage = float(data['cloudCoverage'])

        # Create a point geometry
        # point = ee.Geometry.Point([longitude, latitude])
        lat = 45.4215
        lon = -75.6972
        point = ee.Geometry.Point([lon, lat])


        # Filter the Landsat 9 image collection
        # collection = ee.ImageCollection('LANDSAT/LC09/C02/T1_L2') \
        #     .filterDate(start_date, end_date) \
        #     .filterBounds(point) \
        #     .filter(ee.Filter.lt('CLOUD_COVER', cloud_coverage))
        landsat_sr = ee.ImageCollection('LANDSAT/LC09/C02/T1_L2') \
                .filterBounds(point) \
                .filterDate('2023-01-01', '2023-12-31') \
                .filter(ee.Filter.lt('CLOUD_COVER', 10))

        # Get the first image from the collection
        # image = collection.first()
        image = landsat_sr.first()
        # Check if an image exists
        if image.getInfo() is None:
            return jsonify({'error': 'No images found for the given parameters.'}), 404

        # Get the pixel value at the point
        selected_pixel = image.sample(point, scale=30).first().toDictionary().getInfo()

        # Get surrounding pixels (e.g., a 3x3 window around the point)
        neighborhood = image.neighborhoodToArray(ee.Kernel.square(1))
        neighborhood_values = neighborhood.sample(point, scale=30).first().toDictionary().getInfo()

        # Return the pixel data
        return jsonify({
            'selectedPixel': selected_pixel,
            'surroundingPixels': neighborhood_values
        })

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

