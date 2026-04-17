import React from "react";
import { motion } from "framer-motion";

const actionMap = {
  One: "Opening YouTube ",
  Two: "Closing Tab ",
  Three: "Opening Google ",
  Four: "Closing Tab ",
  Palm: "Scrolling Down ⬇",
  Fist: "Scrolling Up ⬆",
};

export default function LivePanel({ gesture }) {
  if (!gesture) {
    return (
      <div className="panel highlight">
        <h3>Detection Engine</h3>
        <p>Waiting for gesture...</p>
      </div>
    );
  }

  const confidence = Math.round(gesture.confidence * 100);
  const displayAction = actionMap[gesture.gesture] || "No Action";

  return (
    <motion.div
      className="panel highlight"
      key={gesture.gesture}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3>Live Detection</h3>

      <div className="gesture-box">
        <div className="gesture-name">{gesture.gesture}</div>

        {/* NEW ACTION DISPLAY */}
        <div className="gesture-action">{displayAction}</div>

        {/* Confidence */}
        <div className="confidence">
          <div className="confidence-text">
            Confidence: {confidence}%
          </div>
          <div className="bar">
            <div
              className="fill"
              style={{ width: `${confidence}%` }}
            ></div>
          </div>
        </div>

        {/* Status */}
        <div className="status-text">
          {confidence > 80 ? "✔ Executing" : "…Detecting"}
        </div>

        <p className="description">
          Gesture is interpreted and mapped to system actions like opening apps
          or controlling scrolling behavior in real time.
        </p>
      </div>
    </motion.div>
  );
}