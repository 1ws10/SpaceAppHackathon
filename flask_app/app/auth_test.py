import ee
import os

def test_ee_auth():
    try:
        key_file_path = os.path.join(os.path.dirname(__file__), 'ca2rcnasaapps-8f08cba490d7.json')
        service_account = 'demoserviceaccount@ca2rcnasaapps.iam.gserviceaccount.com'
        credentials = ee.ServiceAccountCredentials(service_account, key_file_path)
        ee.Initialize(credentials)
        print("Earth Engine initialized successfully.")

        # Test accessing a dataset
        dataset = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2').first().getInfo()
        print("Accessed dataset successfully:", dataset['id'])
    except Exception as e:
        print(f"Error during Earth Engine authentication test: {e}")

if __name__ == '__main__':
    test_ee_auth()
