from flask import Flask, render_template, request
import time
import datetime
import json
import sampledata

DEVELOPMENT_ENV = True

app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/fetch", methods=["POST"])
def fetch():
    print("Fetch request received")
    print(request.headers.get("Content-Type"))
    print("Request form:", request.form)
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
    print(time_range)

    return sampledata.sample_data


if __name__ == "__main__":
    app.run(debug=DEVELOPMENT_ENV)
