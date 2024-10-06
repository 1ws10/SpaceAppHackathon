from flask import Flask, Response, send_from_directory, request, jsonify, redirect, url_for, send_file
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
import datetime
import os
import base64
import io
import requests

# Initialize the database and scheduler
db = SQLAlchemy()
scheduler = APScheduler()
load_dotenv()
mail = Mail()

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
    def search():
        latitude = float(request.form['latitude'])
        longitude = float(request.form['longitude'])
        date = request.form['date']

        # Query Landsat overpasses using Earth Engine
        overpasses = get_landsat_overpasses(latitude, longitude, date)

        # Return the overpass metadata as JSON
        return jsonify(overpasses)
    
    @app.route('/api/get-landsat-data', methods=['POST'])
    def get_landsat_data():
        # data = request.json

        # latitude = float(data['latitude'])
        # longitude = float(data['longitude'])
        start_date = '2023-01-01' # data['startDate']
        end_date = '2023-12-31'# data['endDate']
        cloud_coverage = 10 # float(data['cloudCoverage'])

        # point = ee.Geometry.Point([longitude, latitude])
        
        # collection = ee.ImageCollection('LANDSAT/LC09/C02/T1_L2') \
        #     .filterDate(start_date, end_date) \
        #     .filterBounds(point) \
        #     .filter(ee.Filter.lt('CLOUD_COVER', cloud_coverage))

        # 

        # Define the location
        latitude = 45.4215
        longitude = -75.6972
        point = ee.Geometry.Point([longitude, latitude])

        # Load Landsat 9 Surface Reflectance Image Collection
        collection = ee.ImageCollection('LANDSAT/LC09/C02/T1_L2') \
                        .filterBounds(point) \
                        .filterDate(start_date, end_date) \
                        .filter(ee.Filter.lt('CLOUD_COVER', cloud_coverage))
        
        image = collection.first()

        if image.getInfo() is None:
            return jsonify({'error': 'No images found for the given parameters.'}), 404

        vis_params = {
            'bands': ['SR_B4', 'SR_B3', 'SR_B2'],
            'min': 0,
            'max': 3000,
        }

        map_dict = image.getMapId(vis_params)

        return jsonify({
            'mapid': map_dict['mapid'],
            'token': map_dict['token'],
            'latitude': latitude,
            'longitude': longitude
        })

    
    @app.route('/tiles/<path:mapid>/<int:z>/<int:x>/<int:y>.png')
    def get_tile(mapid, z, x, y):
        token = request.args.get('token', None)
        if token:
            tile_url = f'https://earthengine.googleapis.com/map/{mapid}/{z}/{x}/{y}?token={token}'
        else:
            tile_url = f'https://earthengine.googleapis.com/map/{mapid}/{z}/{x}/{y}'
        print(f"Fetching tile from URL: {tile_url}")  # Log the tile URL
        tile_response = requests.get(tile_url)
        if tile_response.status_code == 200:
            return Response(tile_response.content, content_type='image/png')
        else:
            print(f"Failed to fetch tile: {tile_response.status_code}")  # Log any errors
            return Response(status=tile_response.status_code)
        
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
