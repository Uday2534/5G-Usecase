import React from "react";
import { motion } from "framer-motion";

export default function CameraPanel({ frame }) {
  return (
    <motion.div
      className="panel"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <h3>Live Camera Feed</h3>

      {frame ? (
        <img
          src={`data:image/jpeg;base64,${frame}`}
          alt="camera"
          className="camera"
        />
      ) : (
        <div className="camera loading">Initializing camera...</div>
      )}

      <p className="description">
        This panel shows real-time hand tracking using MediaPipe. The system
        continuously captures video frames and detects hand landmarks for gesture recognition.
      </p>
    </motion.div>
  );
}