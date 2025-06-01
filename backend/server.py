from flask import Flask, request, jsonify, send_file
from flask_cors import CORS

from speech_to_asl import audio_to_asl
import os
import uuid


app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])

TEMP_FOLDER = "temp"

@app.route('/api/generate', methods=['POST'])
def generate():
    clear_temp_directory()
    if 'file' not in request.files or 'fileType' not in request.form:
        return jsonify({'error': 'Missing file or fileType'}), 400

    file = request.files['file']
    file_type = request.form['fileType']

    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    ext = file.filename.rsplit('.', 1)[-1].lower()
    filename = f"{uuid.uuid4()}.{ext}"
    filepath = os.path.join(TEMP_FOLDER, filename)
    file.save(filepath)

    if file_type == 'video':
        try:
            filepath = extract_audio_from_video(filepath)
        except Exception as e:
            return jsonify({'error': f'Failed to extract audio: {str(e)}'}), 500
        
    output_path = audio_to_asl(filepath, TEMP_FOLDER)
    return send_file(output_path, mimetype='video/mp4', as_attachment=True, download_name='output.mp4')

def extract_audio_from_video(video_path):
    audio_filename = f"{uuid.uuid4()}.mp3"
    audio_path = os.path.join(TEMP_FOLDER, audio_filename)

    clip = VideoFileClip(video_path)
    clip.audio.write_audiofile(audio_path, codec='libmp3lame')
    clip.close()

    return audio_path

def clear_temp_directory():
    for filename in os.listdir(TEMP_FOLDER):
           file_path = os.path.join(TEMP_FOLDER, filename)
           os.remove(file_path)

if __name__ == '__main__':
    if not os.path.exists(TEMP_FOLDER):
        os.mkdir(TEMP_FOLDER)
    app.run(debug=True)
