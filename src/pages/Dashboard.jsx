import { useUser } from "@supabase/auth-helpers-react";
import { useRealtimeRequests } from "../useRealtimeRequests";
import "./Dashboard.css";

const Dashboard = () => {
  const user = useUser();
  const requests = useRealtimeRequests(user?.id);

  const stats = {
    total: requests.length,
    reviewed: requests.filter((r) => r.status === "Reviewed").length,
    pending: requests.filter((r) => r.status === "Pending").length,
  };

  if (!user) {
    return (
      <div className="dash-center-screen">
        <div className="dash-auth-box">
          <h3 className="dash-auth-title">Please sign in to view your dashboard</h3>

          <button
            className="dash-btn-primary"
            onClick={async () => {
              const { supabase } = await import("../supabaseClient");
              supabase.auth.signInWithOAuth({ provider: "google" });
            }}
          >
            Sign In with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dash-container">
      <h1 className="dash-page-title">Dashboard</h1>

      <div className="dash-grid">
        {["Requests Sent", "Reviews Received", "Pending Reviews"].map(
          (title, idx) => {
            const value =
              idx === 0 ? stats.total : idx === 1 ? stats.reviewed : stats.pending;

            return (
              <div className="dash-card" key={idx}>
                <h5 className="dash-card-title">{title}</h5>
                <p className="dash-card-value">{value}</p>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
};

export default Dashboard;
