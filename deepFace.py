import os
import cv2
from flask import Flask, jsonify, request
from flask_cors import CORS
from deepface import DeepFace
import logging

app = Flask(__name__)
CORS(app)  # Enable CORS for the entire app

# Supported image file extensions
SUPPORTED_EXTENSIONS = ('.jpg', '.jpeg', '.png', '.bmp', '.gif')

# Set up logging for debugging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

@app.route('/analyze_emotions', methods=['GET'])
def analyze_emotions():
    # Get folder path from the request
    folder_path = request.args.get('folder_path')
    logging.debug(f"Received folder_path: {folder_path}")

    # Validate folder_path
    if not folder_path:
        logging.error("Folder path not provided.")
        return jsonify({"error": "Folder path not provided."}), 400

    if not os.path.exists(folder_path):
        logging.error(f"Folder does not exist: {folder_path}")
        return jsonify({"error": f"Folder {folder_path} does not exist."}), 404

    # List and analyze image files in the folder
    image_files = [
        f for f in os.listdir(folder_path)
        if f.lower().endswith(SUPPORTED_EXTENSIONS) and not f.lower().startswith("screenshot")
    ]
    results = []

    if not image_files:
        logging.warning(f"No valid images found in folder: {folder_path}")
        return jsonify({"error": f"No valid images found in folder: {folder_path}"}), 404

    for image_file in image_files:
        image_path = os.path.join(folder_path, image_file)
        #logging.debug(f"Processing image: {image_path}")

        # Check if the file exists
        if not os.path.exists(image_path):
            logging.error(f"File does not exist: {image_path}")
            results.append({"file": image_file, "error": f"File does not exist: {image_path}"})
            continue

        # Attempt to read the image
        img = cv2.imread(image_path)
        if img is None:
            logging.error(f"Unable to load the image at {image_path}")
            results.append({"file": image_file, "error": "Invalid image format or corrupted file."})
            continue

        # Analyze emotions using DeepFace
        try:
            res = DeepFace.analyze(img, actions=['emotion'], detector_backend='opencv')
            if isinstance(res, list):
                res = res[0]

            emotions = res['emotion']
            max_emotion = max(emotions, key=emotions.get)

            # Append successful analysis to results
            results.append({
                "file": image_file,
                "emotions": {emotion: f"{score:.2f}" for emotion, score in emotions.items()},
                "dominant_emotion": max_emotion,
                "dominant_score": f"{emotions[max_emotion]:.2f}"
            })
        except Exception as e:
            logging.exception(f"Error analyzing image: {image_path}")
            results.append({"file": image_file, "error": str(e)})

    # Return results as JSON
    return jsonify(results)

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000)
