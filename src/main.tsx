import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { initGlobalErrorLogging } from "./utils/logger";

// Inicializar captura global de errores de la interfaz hacia el log en disco
initGlobalErrorLogging();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

