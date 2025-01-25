import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@/components/theme-provider";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { PrimeReactProvider } from "primereact/api";
import "non.geist";
import "./index.css";
import App from "./app";
import { CustomVideoProvider } from "@/components/context/VideoProvider";
// import Auth from "./pages/auth";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
]);
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CustomVideoProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <PrimeReactProvider>
          <RouterProvider router={router} />
        </PrimeReactProvider>
      </ThemeProvider>
    </CustomVideoProvider>
  </StrictMode>,
);
