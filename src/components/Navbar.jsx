import { NavLink, useNavigate } from "react-router-dom";
import { useUser } from "@supabase/auth-helpers-react";
import { signInWithGoogle, signOut } from "../auth";

function Navbar() {
  const user = useUser();
  const navigate = useNavigate();

  const closeMenu = () => {
    const navbar = document.getElementById("navbarNav");
    if (navbar && navbar.classList.contains("show")) {
      const collapse = new window.bootstrap.Collapse(navbar, { toggle: false });
      collapse.hide();
    }
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
            {["/", "/dashboard", "/send", "/analytics"].map((path, idx) => (
              <li className="nav-item" key={idx}>
                <NavLink
                  className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
                  to={path}
                  onClick={closeMenu}
                  end={path === "/"}
                >
                  {["Home", "Dashboard", "Send Request", "Analytics"][idx]}
                </NavLink>
              </li>
            ))}

            <li className="nav-item ms-3">
              {!user ? (
                <button className="btn btn-light btn-sm" onClick={signInWithGoogle}>
                  Sign In
                </button>
              ) : (
                <button className="btn btn-outline-light btn-sm" onClick={() => signOut(navigate)}>
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
