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
import zipfile
import numpy as np
import rasterio
import imageio
import platform
import sys


if platform.system() == "Windows":
    sys.modules['fcntl'] = None

# USGS API Configuration
USGS_API_URL = 'https://m2m.cr.usgs.gov/api/api/json/stable/'
USGS_APPLICATION_TOKEN = "tu_xRq09xzv1XhYeUEhoyvz7KgoEC!aB@3L@ay3V8kXD3qHa6_fGfkqnNtKsHc7I"


# Initialize the database and scheduler
db = SQLAlchemy()
scheduler = APScheduler()
load_dotenv()
mail = Mail()
def extract_and_process(zip_file_path):
    with zipfile.ZipFile(zip_file_path, 'r') as zip_ref:
        zip_ref.extractall('tmp/extracted')

    # Find the relevant bands
    band_paths = {
        'red': None,
        'green': None,
        'blue': None
    }

    for root, dirs, files in os.walk('tmp/extracted'):
        for file in files:
            if file.endswith('_SR_B4.TIF'):
                band_paths['red'] = os.path.join(root, file)
            elif file.endswith('_SR_B3.TIF'):
                band_paths['green'] = os.path.join(root, file)
            elif file.endswith('_SR_B2.TIF'):
                band_paths['blue'] = os.path.join(root, file)

    if None in band_paths.values():
        raise Exception('Required bands not found in the downloaded data.')

    # Read and stack the bands
    red = rasterio.open(band_paths['red']).read(1)
    green = rasterio.open(band_paths['green']).read(1)
    blue = rasterio.open(band_paths['blue']).read(1)

    rgb = np.dstack((red, green, blue))

    # Normalize the data
    rgb = np.clip(rgb, 0, 10000)  # Landsat data ranges from 0 to 10000
    rgb = (rgb / 10000) * 255
    rgb = rgb.astype(np.uint8)

    # Save the image
    output_path = 'static/output_image.jpg'
    imageio.imwrite(output_path, rgb)

    return output_path

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


def usgs_login():
    payload = {
        'username': "rubiojack123@gmail.com",
        'applicationToken': USGS_APPLICATION_TOKEN
    }
    response = requests.post(f'{USGS_API_URL}login', json=payload)
    result = response.json()
    if result.get('errorCode'):
        raise Exception(f"USGS Login Error: {result['errorMessage']}")
    return result['data']

def usgs_logout(api_key):
    payload = {'apiKey': api_key}
    requests.post(f'{USGS_API_URL}logout', json=payload)


def search_landsat(api_key, latitude, longitude, start_date, end_date, cloud_coverage):
    payload = {
        'apiKey': api_key,
        'datasetName': 'LANDSAT_9_C2_L2',
        'spatialFilter': {
            'filterType': 'mbr',
            'lowerLeft': {'latitude': latitude - 0.1, 'longitude': longitude - 0.1},
            'upperRight': {'latitude': latitude + 0.1, 'longitude': longitude + 0.1},
        },
        'temporalFilter': {
            'startDate': start_date,
            'endDate': end_date,
        },
        'additionalCriteria': {
            'filterType': 'and',
            'childFilters': [
                {
                    'filterType': 'value',
                    'fieldId': 20557,  # CLOUD_COVER
                    'value': cloud_coverage,
                    'operand': '<=',
                },
            ],
        },
        'maxResults': 1,
        'startingNumber': 1,
        'sortOrder': 'ASC',
    }
    response = requests.post(f'{USGS_API_URL}scene-search', json=payload)
    result = response.json()
    if result['errorCode']:
        raise Exception(f"USGS Search Error: {result['errorMessage']}")
    return result['data']['results']

def download_landsat_data(api_key, entity_id, product_id):
    payload = {
        'apiKey': api_key,
        'datasetName': 'LANDSAT_9_C2_L2',
        'entityIds': [entity_id],
        'products': ['STANDARD']
    }
    response = requests.post(f'{USGS_API_URL}download-request', json=payload)
    result = response.json()
    if result['errorCode']:
        raise Exception(f"USGS Download Error: {result['errorMessage']}")
    download_url = result['data'][0]['url']
    return download_url

def process_landsat_image(file_path):
    # Open the bands you need (e.g., Red, Green, Blue)
    with rasterio.open(file_path) as src:
        # Read RGB bands (assuming bands 4, 3, 2 correspond to RGB)
        red = src.read(4)
        green = src.read(3)
        blue = src.read(2)

        # Stack bands
        rgb = np.dstack((red, green, blue))

        # Normalize and convert to uint8
        rgb = (rgb / rgb.max()) * 255
        rgb = rgb.astype(np.uint8)

        # Save as JPEG
        output_path = 'static/output_image.jpg'
        imageio.imwrite(output_path, rgb)

    return output_path


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
    
    # Update your route
    @app.route('/api/get-landsat-data', methods=['POST'])
    def get_landsat_data():
        data = request.json

        latitude = float(data['latitude'])
        longitude = float(data['longitude'])
        start_date = data['startDate']
        end_date = data['endDate']
        cloud_coverage = float(data['cloudCoverage'])
        api_key = None
        try:
            # Authenticate
            api_key = usgs_login()

            # Search for scenes
            scenes = search_landsat(api_key, latitude, longitude, start_date, end_date, cloud_coverage)
            if not scenes:
                return jsonify({'error': 'No images found for the given parameters.'}), 404

            # Get the first scene
            scene = scenes[0]
            entity_id = scene['entityId']
            product_id = scene['displayId']

            # Request download URL
            download_url = download_landsat_data(api_key, entity_id, product_id)

            # Download the data
            response = requests.get(download_url)
            zip_file_path = f'tmp/{entity_id}.zip'
            with open(zip_file_path, 'wb') as f:
                f.write(response.content)

            # Extract and process the image After downloading the ZIP file
            image_url = extract_and_process(zip_file_path)

            return jsonify({
                'image_url': image_url,
                'latitude': latitude,
                'longitude': longitude
            })
        except Exception as e:
            return jsonify({'error': str(e)}), 500
        finally:
            if api_key is not None:
                usgs_logout(api_key)
    
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
