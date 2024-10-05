from flask import Flask, render_template
from controller import search_blueprint  # Import blueprint from controller
from fetch_controller import fetch_blueprint

app = Flask(__name__)

# Register the blueprint with the main app
app.register_blueprint(search_blueprint)
app.register_blueprint(fetch_blueprint)


@app.route("/")
def index():
    return render_template("index.html")


if __name__ == "__main__":
    app.run(debug=True)
