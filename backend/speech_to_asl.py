import json
import whisper
from langgraph.graph import StateGraph, MessagesState
from langgraph.graph import START, END

import spacy

nlp = spacy.load("en_core_web_sm")

COORDINATE_DATA = "coordinates.json"

def transcribe_audio(state):
    audio_file_path = state.get("messages")[-1].content
    
    model = whisper.load_model("base")
    transcription = model.transcribe(audio_file_path)
    state["messages"].append({"role": "user", "content": transcription["text"]})

    return state

def english_to_asl_structure(state):
    text = state.get("messages")[-1].content
    doc = nlp(text)
    
    time_markers = []
    topics = []
    verbs = []
    objects = []
    others = []
    
    negation = False
    
    for token in doc:
        if token.dep_ == "neg":
            negation = True
            continue
            
        if token.ent_type_ == "DATE" or token.ent_type_ == "TIME" or token.text.lower() in ["today", "tomorrow", "yesterday", "now", "later"]:
            time_markers.append(token.text.upper())
        
        elif token.pos_ == "DET" or (token.lemma_ == "be" and token.pos_ == "AUX"):
            continue
            
        elif token.dep_ in ["nsubj", "nsubjpass"]:
            topics.append(token.text.upper())
            
        elif token.pos_ == "VERB":
            verbs.append(token.text.upper())
            
        elif token.dep_ in ["dobj", "pobj"]:
            objects.append(token.text.upper())
            
        elif token.pos_ not in ["PUNCT", "ADP", "PART"]:
            others.append(token.text.upper())
    
    asl_components = time_markers + topics + objects + verbs
    
    if negation:
        asl_components.append("NOT")
        
    asl_structure = " ".join(asl_components)
    state["messages"].append({"role": "user", "content": asl_structure})

    return state

def get_asl_coordinates(text):
    words = text.split(' ')
    with open(COORDINATE_DATA, 'r') as file:
        coordinates = json.load(file)
    word_cords = {}
    for word in words:
        cord = coordinates.get(word)
        if cord != None:
            word_cords[word] = cord
        else:
            spell_coord =[]
            for let in word:
                spell_coord.append(coordinates[let])
            word_cords[word] = spell_coord

    return word_cords

graph = StateGraph(MessagesState)

graph.add_node("transcribe_audio", transcribe_audio)
graph.add_node("asl_structure", english_to_asl_structure)
graph.add_node("get_asl_coordinates", get_asl_coordinates)

graph.add_edge(START, "transcribe_audio")
graph.add_edge("transcribe_audio", "asl_structure")
graph.add_edge("asl_structure", END)

compiled_graph = graph.compile()

import cv2
import numpy as np
import matplotlib.pyplot as plt
import pyvista as pv
import os
from moviepy import ImageSequenceClip

IMAGE_WIDTH = 800
IMAGE_HEIGHT = 750
LEFT_HAND_OFFSET = np.array([-0.02, 0.0, 0.0])
RIGHT_HAND_OFFSET = np.array([0.02, 0.0, 0.0])

WHITE_IMAGE = np.full((IMAGE_WIDTH, IMAGE_HEIGHT, 3), 255, dtype=np.uint8)

def draw_hand(coordinates, plotter, side, coord_mean):
    if len(coordinates) == 0:
        return
    if side == 'left':
        offset = LEFT_HAND_OFFSET
    else:
        offset = RIGHT_HAND_OFFSET
    bones = [
        (0, 1), (1, 2), (2, 3), (3, 4),
        (0, 5), (5, 6), (6, 7), (7, 8),
        (5, 9), (9, 10), (10, 11), (11, 12),
        (9, 13), (13, 14), (14, 15), (15, 16),
        (13, 17), (17, 18), (18, 19), (19, 20),
        (0, 17)
        ]
    points = np.array(list(coordinates.values()))
    points = points[:, [0, 2, 1]]
    points[:, 2] *= -1 
    points -= coord_mean
    points += offset

    for pt in points:
        sphere = pv.Sphere(radius=0.008, center=pt)
        plotter.add_mesh(sphere, color="black")
    for start, end in bones:
        line = pv.Line(points[start], points[end], )
        tube = line.tube(radius=0.005)
        plotter.add_mesh(tube, color="blue")

def get_coordinate_mean(coordinates):
    all_coords = []
    for word in coordinates:
        word_cord = coordinates[word]
        if word_cord[0].get('Left Hand Coordinates') != None:
            for cord in word_cord:
                left_coord = cord["Left Hand Coordinates"]
                right_coord = cord["Right Hand Coordinates"]
                if len(left_coord) != 0:
                    all_coords.extend(np.array(list(left_coord.values())))
                if len(right_coord) != 0:
                    all_coords.extend(np.array(list(right_coord.values())))
        else:    
            for let_cord in word_cord:
                all_coords.extend(np.array(list(let_cord.values())))
    all_coords = np.array(all_coords)
    all_coords = all_coords[:, [0, 2, 1]]
    all_coords[:, 2] *= -1
    return np.mean(all_coords, axis=0)

def audio_to_asl(file_path, dest_folder):
    result = compiled_graph.invoke({"messages": file_path})
    coordinates = get_asl_coordinates(result["messages"][-1].content)

    dest_path = os.path.join(dest_folder, "output.mp4")

    plotter = pv.Plotter(off_screen=True, window_size=(IMAGE_HEIGHT, IMAGE_WIDTH))
    plotter.set_background('white')
    plotter.set_focus((0, 0, 0))
    plotter.camera_position = [
        (0, -2, 0),
        (0, 0, 0), 
        (0, 0, 1), 
    ]

    coord_mean = get_coordinate_mean(coordinates)
    frames = []
    for word in coordinates:
        word_cord = coordinates[word]        
        if word_cord[0].get('Left Hand Coordinates') != None:
            for cord in word_cord:
                plotter.clear()
                left_coord = cord["Left Hand Coordinates"]
                draw_hand(left_coord, plotter, 'left', coord_mean)
                right_coord = cord["Right Hand Coordinates"]
                draw_hand(right_coord, plotter, 'right', coord_mean)

                img = plotter.screenshot(transparent_background=False)
                image = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
                cv2.putText(
                    image,
                    word,
                    org=(50, 100),
                    fontFace=cv2.FONT_HERSHEY_SIMPLEX,
                    fontScale=1.2,
                    color=(0, 0, 255),
                    thickness=2,
                    lineType=cv2.LINE_AA
                )
                image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
                for _ in range(5):
                    frames.append(image)
        else:
            word_blank_image = WHITE_IMAGE.copy()
            cv2.putText(
                    word_blank_image,
                    word,
                    org=(50, 100),
                    fontFace=cv2.FONT_HERSHEY_SIMPLEX,
                    fontScale=1.2,
                    color=(255, 0, 0),
                    thickness=2,
                    lineType=cv2.LINE_AA
                )
            for let_cord in word_cord:
                plotter.clear()
                draw_hand(let_cord, plotter, 'left', coord_mean)
                img = plotter.screenshot(transparent_background=False)
                image = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
                cv2.putText(
                    image,
                    word,
                    org=(50, 100),
                    fontFace=cv2.FONT_HERSHEY_SIMPLEX,
                    fontScale=1.2,
                    color=(0, 0, 255),
                    thickness=2,
                    lineType=cv2.LINE_AA
                )
                image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
                for _ in range(30):
                    frames.append(image)
                for _ in range(30):
                    frames.append(word_blank_image)
        for _ in range(40):
                frames.append(WHITE_IMAGE)

    clip = ImageSequenceClip(frames, fps=20)
    clip.write_videofile(dest_path, codec="libx264", bitrate="5000k")
    return dest_path

if __name__ == "__main__":
    audio_to_asl("C:\\Dev\\HackAI\\backend\\test.wav", "C:\\Dev\\HackAI\\backend")
