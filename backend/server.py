import cv2
import mediapipe as mp
import asyncio
import websockets
import json
import base64
from collections import deque, Counter

import webbrowser
import time
import pyautogui

# -------------------------------
# MediaPipe Setup
# -------------------------------
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(
    max_num_hands=1,
    min_detection_confidence=0.7,
    min_tracking_confidence=0.7
)
mp_draw = mp.solutions.drawing_utils

clients = set()

# -------------------------------
# Buffer for smoothing
# -------------------------------
buffer = deque(maxlen=8)

# -------------------------------
# ACTION CONTROL
# -------------------------------
last_action_time = 0
COOLDOWN = 2

def perform_action(gesture):
    global last_action_time

    current_time = time.time()

    # -------------------------------
    # CONTINUOUS SCROLL (NO COOLDOWN)
    # -------------------------------
    if gesture == "Palm":
        pyautogui.scroll(-50)  # scroll down
        return

    elif gesture == "Fist":
        pyautogui.scroll(50)   # scroll up
        return

    # -------------------------------
    # NORMAL ACTIONS (WITH COOLDOWN)
    # -------------------------------
    if current_time - last_action_time < COOLDOWN:
        return

    last_action_time = current_time

    print(f"🔥 Action Triggered: {gesture}")

    try:
        if gesture == "One":
            webbrowser.open("https://www.youtube.com")

        elif gesture == "Two":
            pyautogui.hotkey("ctrl", "w")

        elif gesture == "Three":
            webbrowser.open("https://www.google.com")

        elif gesture == "Four":
            pyautogui.hotkey("ctrl", "w")

    except Exception as e:
        print(f"⚠️ Action Error: {e}")

# -------------------------------
# Finger Detection (UNCHANGED)
# -------------------------------
def get_finger_states(landmarks, hand_label):
    fingers = []

    if hand_label == "Right":
        fingers.append(1 if landmarks[4].x < landmarks[3].x else 0)
    else:
        fingers.append(1 if landmarks[4].x > landmarks[3].x else 0)

    for tip in [8, 12, 16, 20]:
        fingers.append(1 if landmarks[tip].y < landmarks[tip - 2].y else 0)

    return fingers

# -------------------------------
# Gesture Mapping (UNCHANGED)
# -------------------------------
def map_gesture(fingers):
    count = sum(fingers)

    if count == 0:
        return "Fist", "All OFF"
    elif count == 1:
        return "One", "Light ON"
    elif count == 2:
        return "Two", "Fan ON"
    elif count == 3:
        return "Three", "TV ON"
    elif count == 4:
        return "Four", "AC ON"
    elif count == 5:
        return "Palm", "All ON"
    else:
        return "Unknown", "No Action"

# -------------------------------
# Smoothing (UNCHANGED)
# -------------------------------
def smooth_output(gesture, action):
    buffer.append((gesture, action))

    if len(buffer) < 4:
        return gesture, action, 0.5

    counter = Counter(buffer)
    (g, a), count = counter.most_common(1)[0]

    confidence = count / len(buffer)

    return g, a, round(confidence, 2)

# -------------------------------
# WebSocket
# -------------------------------
async def handler(websocket):
    clients.add(websocket)
    print("Client connected")

    try:
        await websocket.wait_closed()
    finally:
        clients.remove(websocket)
        print("Client disconnected")

async def send_data(data):
    dead_clients = set()

    for client in clients:
        try:
            await client.send(data)
        except:
            dead_clients.add(client)

    for dc in dead_clients:
        clients.remove(dc)

# -------------------------------
# Main Loop
# -------------------------------
async def main():
    cap = cv2.VideoCapture(0)

    async def loop():
        while True:
            ret, frame = cap.read()
            if not ret:
                continue

            frame = cv2.flip(frame, 1)

            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = hands.process(rgb)

            gesture = "No Hand"
            action = "None"
            confidence = 0

            if results.multi_hand_landmarks:
                for handLms, handedness in zip(
                    results.multi_hand_landmarks,
                    results.multi_handedness
                ):
                    label = handedness.classification[0].label

                    mp_draw.draw_landmarks(
                        frame,
                        handLms,
                        mp_hands.HAND_CONNECTIONS
                    )

                    fingers = get_finger_states(handLms.landmark, label)

                    raw_gesture, raw_action = map_gesture(fingers)

                    gesture, action, confidence = smooth_output(
                        raw_gesture,
                        raw_action
                    )

            # 🔥 Perform action
            perform_action(gesture)

            # Encode frame
            _, buffer_img = cv2.imencode(".jpg", frame)
            frame_base64 = base64.b64encode(buffer_img).decode("utf-8")

            data = json.dumps({
                "gesture": gesture,
                "action": action,
                "confidence": confidence,
                "frame": frame_base64
            })

            await send_data(data)

            await asyncio.sleep(0.03)

    server = await websockets.serve(handler, "localhost", 8000)
    print("✅ Running on ws://localhost:8000")

    await loop()

asyncio.run(main())