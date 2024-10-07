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
import commands


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
        loggedIn = authentication.login(email, password)
        if not loggedIn:
            return jsonify({'message': 'Invalid email or password.'}), 401
        return jsonify({'message': 'Login successful!'}), 200
    
    @app.route('/save-data', methods=['POST'])
    def save():
        name = request.form['name']
        lat = request.form['lat']
        long = request.form['long']
        start = request.form['start']
        end = request.form['end']
        email  = request.form['email']
        cloud = request.form['cloud']
        try:
            commands.createData(name, lat, long, start, end, email, cloud)
            return jsonify({'message': 'Successfully added to database!'}), 200
        except:
            jsonify({'message': 'Unable to save to database!'}), 401
            
    @app.route('/get-data', methods=['POST'])
    def get_data():
        email = request.form['email']
        try:
            all_data = commands.getData(email)

            # Convert rows into a list of dictionaries if necessary
            # This step depends on how your data is structured. If you're getting rows as tuples,
            # you can manually format it like this:
            data = []
            for row in all_data:
                data.append({
                    'name': row[0],  
                    'lat': row[1],  
                    'long': row[1],  
                    'cloud': row[1],  
                    'start': row[1],  
                    'end': row[1],  
                    'email': row[1],  
                })

            # Return data as JSON
            return jsonify(data), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

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


    @app.route('/search-data', methods=['POST'])
    def search_data():
        # Extract body data from the request
        data = request.json
        latitude = float(data['latitude'])
        longitude = float(data['longitude'])
        start_date = data['startDate']
        end_date = data['endDate']
        cloud_coverage = float(data['cloudCoverage'])

        point = ee.Geometry.Point([longitude, latitude])


        # Filter the Landsat 9 image collection
        # collection = ee.ImageCollection('LANDSAT/LC09/C02/T1_L2') \
        #     .filterDate(start_date, end_date) \
        #     .filterBounds(point) \
        #     .filter(ee.Filter.lt('CLOUD_COVER', cloud_coverage))
        landsat_sr = ee.ImageCollection('LANDSAT/LC09/C02/T1_L2') \
                .filterBounds(point) \
                .filterDate(start_date, end_date) \
                .filter(ee.Filter.lt('CLOUD_COVER', cloud_coverage))

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
    @app.route('/data-display')
    @app.route('/search')
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
