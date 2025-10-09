import "./App.css";
import { Outlet } from "react-router-dom";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { supabase } from "./supabaseClient";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

function App() {
  return (
    <SessionContextProvider supabaseClient={supabase}>
      <div className="app_container">
        <Navbar />
        <div className="main_container">
          <Outlet />
        </div>
        <Footer />
      </div>
    </SessionContextProvider>
  );
}

export default App;
