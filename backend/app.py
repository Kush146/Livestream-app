from flask import Flask, jsonify, request, send_from_directory, render_template
from flask_pymongo import PyMongo
import os
from flask_cors import CORS
from bson import ObjectId  # Import ObjectId to handle MongoDB ObjectId serialization

# Initialize Flask app
app = Flask(__name__)

# Enable CORS for all domains
CORS(app)

# Configure MongoDB URI
app.config["MONGO_URI"] = os.getenv("MONGO_URI", "mongodb+srv://kush90:Dracula2004@cluster0.vygxc3v.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
mongo = PyMongo(app)

# Function to convert ObjectId to string for JSON response
def object_id_converter(overlay):
    overlay['_id'] = str(overlay['_id'])  # Convert ObjectId to string
    return overlay

# Check MongoDB connection before processing any requests
@app.before_first_request
def check_db_connection():
    try:
        # Access the database and check if the connection is successful
        db = mongo.db
        if db:
            print("MongoDB connected")
            print("Collections: ", db.list_collection_names())
        else:
            print("MongoDB connection failed")
    except Exception as e:
        print(f"Error while connecting to MongoDB: {e}")

# Serving HLS files (e.g., .m3u8 and .ts)
@app.route('/hls/<filename>')
def get_hls_file(filename):
    return send_from_directory(os.path.join(app.root_path, 'static/hls'), filename)

# Home page route
@app.route('/')
def home():
    return render_template('index.html')  # This will serve index.html page

# Route for creating overlays
@app.route('/api/overlays', methods=['POST'])
def create_overlay():
    data = request.json
    overlay = {'text': data['text'], 'position': data['position']}
    mongo.db.overlays.insert_one(overlay)
    return jsonify({"message": "Overlay created"}), 201

# Route for retrieving all overlays
@app.route('/api/overlays', methods=['GET'])
def get_overlays():
    try:
        overlays = mongo.db.overlays.find()  # Fetch all overlays
        overlays = list(overlays)  # Convert cursor to a list
        overlays = [object_id_converter(overlay) for overlay in overlays]  # Convert ObjectId to string
        return jsonify(overlays)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Route for updating an overlay
@app.route('/api/overlays/<overlay_id>', methods=['PUT'])
def update_overlay(overlay_id):
    try:
        data = request.json
        updated_overlay = {'text': data['text'], 'position': data['position']}
        mongo.db.overlays.update_one({'_id': ObjectId(overlay_id)}, {"$set": updated_overlay})
        return jsonify({"message": "Overlay updated"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Route for deleting an overlay
@app.route('/api/overlays/<overlay_id>', methods=['DELETE'])
def delete_overlay(overlay_id):
    try:
        mongo.db.overlays.delete_one({'_id': ObjectId(overlay_id)})
        return jsonify({"message": "Overlay deleted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Start the Flask app
if __name__ == "__main__":
    app.run(debug=True, port=5000)
