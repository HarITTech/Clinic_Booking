import React from "react";
import ReactDOM from "react-dom/client";  // ✅ This line is crucial
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import "./index.css";  // if you have global styles

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
