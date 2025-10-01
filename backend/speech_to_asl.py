import json
import re
import whisper
from langgraph.graph import StateGraph, MessagesState
from langgraph.graph import START, END

import spacy

nlp = spacy.load("en_core_web_sm")

COORDINATE_DATA = "coordinates.json"

DEFAULT_COORD = {"Left Hand Coordinates": {}, "Right Hand Coordinates": {}}


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

        if token.ent_type_ == "DATE" or token.ent_type_ == "TIME" or token.text.lower() in [
            "today", "tomorrow", "yesterday", "now", "later"
        ]:
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

    asl_structure = re.sub(r'[^A-Za-z0-9 ]+', ' ', asl_structure).strip()

    state["messages"].append({"role": "user", "content": asl_structure})

    return state


def get_asl_coordinates(text):
    """Return a mapping: word -> list of coordinate-dicts.
    Each value is a LIST of dicts. Dicts are either:
      - whole-word dict with 'Left Hand Coordinates' & 'Right Hand Coordinates'
      - per-letter dict mapping joint_key -> [x,y,z]
    """
    words = text.split(' ')
    with open(COORDINATE_DATA, 'r') as file:
        coordinates = json.load(file)

    word_cords = {}
    for word in words:
        if word == "":
            continue
        cord = coordinates.get(word)
        if cord is not None:
            if isinstance(cord, list):
                word_cords[word] = cord
            else:
                word_cords[word] = [cord]
        else:
            spell_coord = []
            for let in word:
                let_cord = coordinates.get(let)
                if let_cord is not None:
                    if isinstance(let_cord, list):
                        spell_coord.extend(let_cord)
                    else:
                        spell_coord.append(let_cord)
                else:
                    print(f"Skipping unknown character: {let}")
                    spell_coord.append(DEFAULT_COORD)
            if not spell_coord:
                spell_coord.append(DEFAULT_COORD)
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
    """Draw a hand given a mapping joint -> [x,y,z] (or dict-like)."""
    if not coordinates:
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

    try:
        points = np.array(list(coordinates.values()), dtype=float)
    except Exception:
        return

    if points.size == 0:
        return

    points = points[:, [0, 2, 1]]
    points[:, 2] *= -1
    points -= coord_mean
    points += offset

    for pt in points:
        sphere = pv.Sphere(radius=0.008, center=pt)
        plotter.add_mesh(sphere, color="black")
    max_idx = points.shape[0] - 1
    for start, end in bones:
        if start <= max_idx and end <= max_idx:
            line = pv.Line(points[start], points[end])
            tube = line.tube(radius=0.005)
            plotter.add_mesh(tube, color="blue")


def get_coordinate_mean(coordinates):
    """Compute mean coordinate across all words and all cords, handling mixed shapes."""
    all_coords = []
    for word in coordinates:
        word_cord = coordinates[word]
        if not word_cord:
            continue  # defensive

        for cord in word_cord:
            if isinstance(cord, dict) and "Left Hand Coordinates" in cord and "Right Hand Coordinates" in cord:
                left_coord = cord.get("Left Hand Coordinates", {})
                right_coord = cord.get("Right Hand Coordinates", {})
                if left_coord:
                    for v in list(left_coord.values()):
                        arr = np.asarray(v, dtype=float)
                        if arr.size == 3:
                            all_coords.append(arr)
                if right_coord:
                    for v in list(right_coord.values()):
                        arr = np.asarray(v, dtype=float)
                        if arr.size == 3:
                            all_coords.append(arr)
            elif isinstance(cord, dict):
                for v in list(cord.values()):
                    arr = np.asarray(v, dtype=float)
                    if arr.size == 3:
                        all_coords.append(arr)
            else:
                continue

    if len(all_coords) == 0:
        return np.array([0.0, 0.0, 0.0], dtype=float)

    all_coords = np.array(all_coords, dtype=float)
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

        for cord in word_cord:
            if isinstance(cord, dict) and "Left Hand Coordinates" in cord and "Right Hand Coordinates" in cord:
                plotter.clear()
                left_coord = cord.get("Left Hand Coordinates", {})
                right_coord = cord.get("Right Hand Coordinates", {})
                draw_hand(left_coord, plotter, 'left', coord_mean)
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

            elif isinstance(cord, dict):
                if ("Left Hand Coordinates" in cord and "Right Hand Coordinates" in cord) and not cord["Left Hand Coordinates"] and not cord["Right Hand Coordinates"]:
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
                    for _ in range(8):
                        frames.append(word_blank_image)
                else:
                    plotter.clear()
                    draw_hand(cord, plotter, 'left', coord_mean)
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
                    for _ in range(30):
                        frames.append(word_blank_image)

            else:
                continue

        for _ in range(40):
            frames.append(WHITE_IMAGE)

    if not frames:
        img = WHITE_IMAGE.copy()
        cv2.putText(img, "No frames", org=(50, 100),
                    fontFace=cv2.FONT_HERSHEY_SIMPLEX, fontScale=1.0,
                    color=(0, 0, 0), thickness=2, lineType=cv2.LINE_AA)
        for _ in range(30):
            frames.append(img)

    clip = ImageSequenceClip(frames, fps=20)
    clip.write_videofile(dest_path, codec="libx264", bitrate="5000k")
    return dest_path


if __name__ == "__main__":
    audio_to_asl("C:\\Dev\\HackAI\\backend\\test.wav", "C:\\Dev\\HackAI\\backend")
