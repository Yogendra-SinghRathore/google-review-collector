import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";

import App from "./App.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import SendRequest from "./pages/SendRequest.jsx";
import Analytics from "./pages/Analytics.jsx";
import Home from "./pages/Home.jsx";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { supabase } from "./supabaseClient";
import CustomersList from "./pages/coustomersList.jsx";
import RedirectReview from "./pages/RedirectReview.jsx";


// React Router configuration
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: "/dashboard", element: <Dashboard /> },
      { path: "/send", element: <SendRequest /> },
      { path: "/analytics", element: <Analytics /> },
      { path: "/customers_list", element: <CustomersList/> },
      { path: "/r/:id", element: <RedirectReview/> },
    ],
  },
]);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js");
  });
}


// Render the app with Supabase session context
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <SessionContextProvider supabaseClient={supabase}>
      <RouterProvider router={router} />
    </SessionContextProvider>
  </StrictMode>
);
