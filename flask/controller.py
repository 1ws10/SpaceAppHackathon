from flask import Blueprint, jsonify, request

# Define a blueprint called 'user_blueprint'
search_blueprint = Blueprint('search', __name__)

# Define a route to get all users
@search_blueprint.route('/search', methods=['GET'])
def get_users():
    res = [{"Search Results": "test"}]  # Mock data
    return jsonify(res)

# Define a route to create a new user
#@search_blueprint.route('/search', methods=['POST'])
#def create_user():
    #data = request.json
    #new_user = {"id": 3, "name": data['name']}  # Mock data
    #return jsonify(new_user), 201
