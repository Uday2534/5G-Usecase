import React from "react";
import { motion } from "framer-motion";

export default function Header() {
  return (
    <motion.div
      className="header"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h1>Gesture Control Dashboard</h1>
      <p className="subtitle">
        Real-time AI-based hand gesture recognition system
      </p>
    </motion.div>
  );
}