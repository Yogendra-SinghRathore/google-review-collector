import { useUser } from "@supabase/auth-helpers-react";
import { useRealtimeRequests } from "../useRealtimeRequests";

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
      <div className="d-flex justify-content-center align-items-center vh-100">

        <div className="text-center">
          <h3>Please sign in to view your dashboard</h3>
          <button
            className="btn btn-primary mt-3"
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
    <div className="container py-4">
      <h1 className="mb-4">Dashboard</h1>
      <div className="row">
        {["Requests Sent", "Reviews Received", "Pending Reviews"].map(
          (title, idx) => {
            const value =
              idx === 0 ? stats.total : idx === 1 ? stats.reviewed : stats.pending;
            return (
              <div className="col-md-4 mb-3" key={idx}>
                <div className="card text-center">
                  <div className="card-body">
                    <h5 className="card-title">{title}</h5>
                    <p className="card-text fs-3">{value}</p>
                  </div>
                </div>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
};

export default Dashboard;
