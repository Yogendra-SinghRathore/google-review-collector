import { NavLink, useNavigate } from "react-router-dom";
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";
import { signInWithGoogle, signOut } from "../auth";
import { useState, useEffect } from "react";
import "./Navbar.css";

function Navbar() {
  const user = useUser();
  const supabase = useSupabaseClient();
  const navigate = useNavigate();

  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [businessDetails, setBusinessDetails] = useState(null);

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/dashboard", label: "Dashboard" },
    { path: "/send", label: "Send Request" },
    { path: "/analytics", label: "Analytics" },
  ];

  const profileImage =  user?.user_metadata?.avatar_url ||
    user?.raw_user_meta_data?.avatar_url ||
    user?.user_metadata?.picture ||
    user?.raw_user_meta_data?.picture ||
    null;
  const email = user?.email || "";

  // Fetch business details from `profiles` table
  useEffect(() => {
    if (!user) return;

    const fetchBusinessDetails = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("business_name, business_link")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching business details:", error);
        setBusinessDetails(null);
      } else {
        setBusinessDetails(data);
      }
    };

    fetchBusinessDetails();
  }, [user, supabase]);


  return (
    <>
      {/* Desktop Navbar */}
      <nav className="navbar navbar-expand-sm navbar-dark bg-primary sticky-top d-none d-sm-flex">
        <div className="container">
          <NavLink to={"/"} className="navbar-brand">
              Review Collector
          </NavLink>
          
          <ul className="navbar-nav ms-auto align-items-center">
            {navLinks.map(({ path, label }) => (
              <li className="nav-item" key={path}>
                <NavLink
                  className={({ isActive }) =>
                    "nav-link" + (isActive ? " active" : "")
                  }
                  to={path}
                  end={path === "/"}
                >
                  {label}
                </NavLink>
              </li>
            ))}

            <li className="nav-item ms-3">
              {!user ? (
                <button
                  className="btn btn-light btn-sm text-black d-flex align-items-center justify-content-center rounded-circle p-2"
                  style={{ width: "40px", height: "40px" }}
                  onClick={signInWithGoogle}
                >
                  <i className="ri-user-add-fill fs-5"></i>
                </button>
              ) : (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="rounded-circle"
                  style={{
                    width: "40px",
                    height: "40px",
                    cursor: "pointer",
                    objectFit: "cover",
                  }}
                  onClick={() => setShowOffcanvas(true)}
                  title="Profile"
                />
              )}
            </li>
          </ul>
        </div>
      </nav>

      {/* Mobile Top Navbar */}
      <nav className="navbar navbar-dark bg-primary d-flex d-sm-none justify-content-between px-3 py-2">
        <NavLink to={"/"} className="navbar-brand">
              Review Collector
          </NavLink>
        <div>
          {!user ? (
            <button
              className="btn btn-light btn-sm text-black d-flex align-items-center justify-content-center rounded-circle p-2"
              style={{ width: "40px", height: "40px" }}
              onClick={signInWithGoogle}
            >
              <i className="ri-user-add-fill fs-5"></i>
            </button>
          ) : (
            <img
              src={profileImage}
              alt="Profile"
              className="rounded-circle"
              style={{
                width: "40px",
                height: "40px",
                cursor: "pointer",
                objectFit: "cover",
              }}
              onClick={() => setShowOffcanvas(true)}
              title="Profile"
            />
          )}
        </div>
      </nav>

      {/* Bottom Navbar (Mobile) */}
      <nav className="mobile_navbar navbar navbar-dark bg-white fixed-bottom d-flex align-items-center d-sm-none justify-content-around py-3">
        {navLinks.map(({ path, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              "mobile_navbar_links nav-link text-center " +
              (isActive ? " active" : "")
            }
            end={path === "/"}
          >
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Offcanvas Sidebar */}
      {showOffcanvas && (
        <>
          <div
            className="offcanvas-backdrop show"
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              zIndex: 1040,
            }}
            onClick={() => setShowOffcanvas(false)}
          ></div>

          <div
            className="offcanvas offcanvas-end show"
            style={{
              width: "300px",
              backgroundColor: "#fff",
              position: "fixed",
              top: 0,
              right: 0,
              height: "100%",
              zIndex: 1045,
              boxShadow: "-4px 0 8px rgba(0,0,0,0.2)",
            }}
          >
            <div className="offcanvas-header d-flex justify-content-between align-items-center border-bottom p-3">
              <h5 className="mb-0">Profile</h5>
              <button
                className="btn-close"
                onClick={() => setShowOffcanvas(false)}
              ></button>
            </div>

            <div className="offcanvas-body p-3 text-center">
              <img
                src={profileImage}
                alt="User Avatar"
                className="rounded-circle mb-3"
                style={{ width: "4em", height: "4em", objectFit: "cover" }}
              />
              <h6 className="mb-1">{email}</h6>

              {businessDetails ? (
                <div className="mt-3">
                  <p className="mb-0">{businessDetails.business_name}</p>
                  <a
                    href={businessDetails.business_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="business_link text-primary d-block mb-2"
                  >
                    {businessDetails.business_link}
                  </a>

                  {/* ✅ EDIT BUTTON */}
                  <button
                    className="btn btn-primary btn-sm mt-1"
                    onClick={() => {
                      setShowOffcanvas(false);
                      navigate("/", { state: { editMode: true } });
                    }}
                  >
                  Edit Business Details
                  </button>
                </div>
              ) : (
                <button
                  className="btn btn-outline-primary mt-3"
                  onClick={() => {
                    navigate("/", { state: { editMode: true } });
                    setShowOffcanvas(false);
                  }}
                >
                  Add Business Details
                </button>
              )}

              <hr className="my-4" />

              <button
                className="btn btn-danger w-100"
                onClick={() => {
                  signOut();
                  setShowOffcanvas(false);
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default Navbar;
