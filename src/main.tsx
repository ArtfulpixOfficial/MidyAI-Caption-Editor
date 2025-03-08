import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@/components/theme-provider";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { PrimeReactProvider } from "primereact/api";
import "non.geist";
import "./index.css";
import App from "./app";
import Auth from "./pages/auth";
import { CustomVideoProvider } from "@/components/context/VideoProvider";

// Function to hide loader
const hideLoader = () => {
  const loader = document.getElementById("app-loader");
  if (loader) {
    // Add a fade-out transition
    loader.style.opacity = "0";
    loader.style.transition = "opacity 0.3s ease";

    // Remove loader from DOM after transition
    setTimeout(() => {
      loader.style.display = "none";
    }, 300);
  }
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  // {
  //   path: "/auth",
  //   element: <Auth />,
  // },
]);

// Create root and render app
const rootElement = document.getElementById("root");

if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <CustomVideoProvider>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <PrimeReactProvider>
            <RouterProvider router={router} />
          </PrimeReactProvider>
        </ThemeProvider>
      </CustomVideoProvider>
    </StrictMode>
  );

  // Hide loader after render
  hideLoader();
}
// Fallback in case the app takes longer to load
window.addEventListener("load", hideLoader);
