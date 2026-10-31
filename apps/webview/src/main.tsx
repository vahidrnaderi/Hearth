import { createRoot } from "react-dom/client";
import { App } from "./App.js";
import styles from "./styles.css";

const style = document.createElement("style");
style.textContent = styles;
document.head.appendChild(style);

const root = document.getElementById("root");
if (!root) {
  throw new Error("Missing #root element");
}

createRoot(root).render(<App />);
