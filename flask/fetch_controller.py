from flask import Blueprint, request
import time
import datetime
import json
import sampledata

fetch_blueprint = Blueprint("fetch", __name__)

band_wavelegths = {
    "SR_B1": 0.44,
    "SR_B2": 0.48,
    "SR_B3": 0.56,
    "SR_B4": 0.65,
    "SR_B5": 0.86,
    "SR_B6": 1.6,
    "SR_B7": 2.2,
}


def get_band_averages(bands):
    pass


@fetch_blueprint.route("/fetch", methods=["POST"])
def fetch():
    print("Fetch request received")
    print("Content type: ", request.headers.get("Content-Type"))
    latitude = float(request.form.get("latitude"))
    longitude = float(request.form.get("longitude"))
    cloud_cover = request.form.get("cloud_coverage")
    start_date = request.form.get("start_date")
    end_date = request.form.get("end_date")
    start_date_rfc3339 = (
        datetime.datetime.strptime(start_date, "%Y-%m-%d").isoformat() + "Z"
    )
    end_date_rfc3339 = (
        datetime.datetime.strptime(end_date, "%Y-%m-%d").isoformat() + "Z"
    )
    time_range = f"{start_date_rfc3339}/{end_date_rfc3339}"

    return sampledata.sample_data
