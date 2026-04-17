import React from "react";
import { motion } from "framer-motion";

const actionMap = {
  One: "YouTube",
  Two: "Close Tab",
  Three: "Google",
  Four: "Close Tab",
  Palm: "Scroll Down",
  Fist: "Scroll Up",
};

export default function HistoryPanel({ history }) {
  return (
    <motion.div
      className="panel"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h3>Gesture History</h3>

      <div className="history">
        {history.map((h, i) => (
          <div key={i} className="history-item">
            <span className="history-gesture">{h.gesture}</span>
            <span className="history-action">
              {actionMap[h.gesture] || "—"}
            </span>
          </div>
        ))}
      </div>

      <p className="description">
        Shows recent interactions including navigation and scrolling commands.
      </p>
    </motion.div>
  );
}