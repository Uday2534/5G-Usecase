import React, { useEffect, useState } from "react";
import Lenis from "lenis";

import Header from "./components/Header";
import CameraPanel from "./components/CameraPanel";
import LivePanel from "./components/LivePanel";
import HistoryPanel from "./components/HistoryPanel";



export default function App() {
  const [gesture, setGesture] = useState(null);
  const [history, setHistory] = useState([]);
  const [frame, setFrame] = useState(null);

  // Smooth scroll (Lenis)
  useEffect(() => {
    const lenis = new Lenis({ smooth: true });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
  }, []);

  // WebSocket connection
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      setGesture(data);
      setFrame(data.frame);

      // ✅ ONLY ADD VALID GESTURES
      if (data.gesture !== "No Hand") {
        setHistory((prev) => [data, ...prev.slice(0, 15)]);
      }
    };

    ws.onclose = () => console.log("WebSocket disconnected");

    return () => ws.close();
  }, []);

  return (
    <div className="app">
      <Header />

      <div className="dashboard">
        {/* LEFT COLUMN - CAMERA */}
        <CameraPanel frame={frame} />

        {/* RIGHT COLUMN - LIVE + HISTORY */}
        <div className="right-column">
          <LivePanel gesture={gesture} />
          <HistoryPanel history={history} />
        </div>
      </div>
    </div>
  );
}