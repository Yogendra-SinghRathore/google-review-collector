import { NavLink } from "react-router-dom";
import { useUser } from "@supabase/auth-helpers-react";
import { signInWithGoogle, signOut } from "../auth";
import "./Navbar.css";

function Navbar() {
  const user = useUser();

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/dashboard", label: "Dashboard" },
    { path: "/send", label: "Send Request" },
    { path: "/analytics", label: "Analytics" },
  ];

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="navbar navbar-expand-sm navbar-dark bg-primary sticky-top d-none d-sm-flex">
        <div className="container">
          <span className="navbar-brand">Review Collector</span>
          <ul className="navbar-nav ms-auto align-items-center">
            {navLinks.map(({ path, label }) => (
              <li className="nav-item" key={path}>
                <NavLink
                  className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
                  to={path}
                  end={path === "/"}
                >
                  {label}
                </NavLink>
              </li>
            ))}
            <li className="nav-item ms-3">
              {!user ? (
                <button className="btn btn-light btn-sm" onClick={signInWithGoogle}>
                  Sign In
                </button>
              ) : (
                <button className="btn btn-outline-light btn-sm" onClick={() => signOut()}>
                  Sign Out
                </button>
              )}
            </li>
          </ul>
        </div>
      </nav>

      {/* Mobile Top Navbar */}
      <nav className="navbar navbar-dark bg-primary d-flex d-sm-none justify-content-between px-3 py-2">
        <span className="navbar-brand">Review Collector</span>
        <div>
          {!user ? (
            <button className="btn btn-light btn-sm" onClick={signInWithGoogle}>
              Sign In
            </button>
          ) : (
            <button className="btn btn-outline-light btn-sm" onClick={() => signOut()}>
              Sign Out
            </button>
          )}
        </div>
      </nav>

      {/* Mobile Bottom Navbar (Links) */}
      <nav className="mobile_navbar navbar navbar-dark bg-white  fixed-bottom d-flex align-items-center d-sm-none justify-content-around py-2">
        {navLinks.map(({ path, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) => "mobile_navbar_links nav-link text-center " + (isActive ? " active" : "")}
            end={path === "/"}
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </>
  );
}

export default Navbar;
