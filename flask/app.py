from flask import Flask, render_template
from controller import search_blueprint  # Import blueprint from controller

app = Flask(__name__)

# Register the blueprint with the main app
app.register_blueprint(search_blueprint)

@app.route('/')
def index():
    return render_template('index.html')  # Home page

if __name__ == '__main__':
    app.run(debug=True)
