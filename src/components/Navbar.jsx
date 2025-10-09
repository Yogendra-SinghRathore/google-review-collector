import { NavLink, useNavigate } from "react-router-dom";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "../supabaseClient";

function Navbar() {
  const user = useUser();
  const navigate = useNavigate();

  const closeMenu = () => {
    const navbar = document.getElementById("navbarNav");
    if (navbar && navbar.classList.contains("show")) {
      const collapse = new window.bootstrap.Collapse(navbar, {
        toggle: false,
      });
      collapse.hide();
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });
    if (error) console.error("Error during sign-in:", error.message);
  };

  return (
    <nav className="navbar navbar-expand-sm navbar-dark bg-primary sticky-top">
      <div className="container">
        <NavLink className="navbar-brand" to="/" onClick={closeMenu}>
          Review Collector
        </NavLink>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            <li className="nav-item">
              <NavLink
                className={({ isActive }) =>
                  "nav-link" + (isActive ? " active" : "")
                }
                to="/"
                end
                onClick={closeMenu}
              >
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                className={({ isActive }) =>
                  "nav-link" + (isActive ? " active" : "")
                }
                to="/dashboard"
                onClick={closeMenu}
              >
                Dashboard
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                className={({ isActive }) =>
                  "nav-link" + (isActive ? " active" : "")
                }
                to="/send"
                onClick={closeMenu}
              >
                Send Request
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                className={({ isActive }) =>
                  "nav-link" + (isActive ? " active" : "")
                }
                to="/analytics"
                onClick={closeMenu}
              >
                Analytics
              </NavLink>
            </li>

            {/* Supabase Auth Buttons */}
            <li className="nav-item ms-3">
              {!user ? (
                <button
                  className="btn btn-light btn-sm"
                  onClick={handleSignIn}
                >
                  Sign In
                </button>
              ) : (
                <button
                  className="btn btn-outline-light btn-sm"
                  onClick={handleSignOut}
                >
                  Sign Out
                </button>
              )}
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
