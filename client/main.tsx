import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Suppress ResizeObserver loop errors in development
if (import.meta.env?.DEV) {
  const resizeObserverLoopErr = 'ResizeObserver loop completed with undelivered notifications.';
  const originalConsoleError = console.error;
  console.error = (...args) => {
    const errorMessage = args[0];
    if (typeof errorMessage === 'string' && errorMessage.includes(resizeObserverLoopErr)) {
      return; // Suppress ResizeObserver loop errors
    }
    originalConsoleError.apply(console, args);
  };
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
