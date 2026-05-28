import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Detect stale-chunk ReferenceErrors that occur when the browser has cached
// an old main bundle but the server has deployed new hashed chunk filenames.
// Auto-reload once to pick up the fresh assets; a flag prevents reload loops.
window.addEventListener("error", (event) => {
  if (event.error instanceof ReferenceError || event.error instanceof SyntaxError) {
    const key = "stale_chunk_reload";
    const last = sessionStorage.getItem(key);
    if (!last || Date.now() - parseInt(last, 10) > 30_000) {
      sessionStorage.setItem(key, String(Date.now()));
      window.location.reload();
    }
  }
});

createRoot(document.getElementById("root")!).render(<App />);
