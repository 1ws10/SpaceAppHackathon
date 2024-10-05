import ee
import matplotlib.pyplot as plt
import numpy as np

# Authenticate and initialize Earth Engine
ee.Authenticate()
ee.Initialize()

# Define the location
lat = 45.4215
lon = -75.6972
point = ee.Geometry.Point([lon, lat])

# Load Landsat 9 Surface Reflectance Image Collection
landsat_sr = (
    ee.ImageCollection("LANDSAT/LC09/C02/T1_L2")
    .filterBounds(point)
    .filterDate("2023-01-01", "2023-12-31")
    .filter(ee.Filter.lt("CLOUD_COVER", 10))
)

# Get the first image from the collection
image = landsat_sr.first()

# Select surface reflectance bands
sr_bands = ["SR_B1", "SR_B2", "SR_B3", "SR_B4", "SR_B5", "SR_B6", "SR_B7"]
image = image.select(sr_bands)

# Extract reflectance values at the point
reflectance_dict = image.reduceRegion(
    reducer=ee.Reducer.first(), geometry=point, scale=30
).getInfo()

# Scale factor for surface reflectance
scale_factor = 10000.0

# Convert to actual reflectance
reflectance_values = []
for band in sr_bands:
    value = reflectance_dict.get(band)
    if value is not None:
        reflectance = value / scale_factor
        reflectance_values.append(reflectance)
    else:
        reflectance_values.append(float("nan"))

# Define central wavelengths for each band
wavelengths = [0.44, 0.48, 0.56, 0.65, 0.86, 1.6, 2.2]  # in micrometers

# Convert lists to numpy arrays
wavelengths = np.array(wavelengths)
reflectance_values = np.array(reflectance_values)

# Plot the reflectance spectrum
plt.figure(figsize=(8, 6))
plt.plot(wavelengths, reflectance_values, marker="o", linestyle="-")
plt.title("Surface Reflectance Spectrum at Location ({}, {})".format(lat, lon))
plt.xlabel("Wavelength (µm)")
plt.ylabel("Reflectance")
plt.grid(True)
plt.xticks(wavelengths)
plt.ylim(0, 1)
plt.show()
