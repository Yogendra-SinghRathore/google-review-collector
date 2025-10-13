import React, { useState, useEffect } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { useRealtimeRequests } from "../useRealtimeRequests";
import { supabase } from "../supabaseClient";

const Analytics = () => {
  const user = useUser();
  const requests = useRealtimeRequests(user?.id);
  const [localRequests, setLocalRequests] = useState([]);

  // Sync localRequests with real-time requests
  useEffect(() => {
    setLocalRequests(requests);
  }, [requests]);

  const updateStatus = async (id, newStatus) => {
    // Optimistic update
    setLocalRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );

    // Send update to Supabase
    const { error } = await supabase
      .from("review_requests")
      .update({ status: newStatus })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error updating status:", error);
      // Rollback if error
      setLocalRequests(requests);
    }
  };

  const exportCSV = () => {
    if (!localRequests.length) return;

    const headers = ["Name", "Phone", "Status", "Date Sent"];
    const rows = localRequests.map((r) => [
      r.name,
      r.phone,
      r.status,
      new Date(r.created_at).toLocaleDateString(),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute(
      "download",
      `review_requests_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.setAttribute("href", encodedUri);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!user) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <h3>Please sign in to view analytics</h3>
          <button
            className="btn btn-primary mt-3"
            onClick={() =>
              supabase.auth.signInWithOAuth({ provider: "google" })
            }
          >
            Sign In with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h1 className="mb-3">Analytics</h1>

      {localRequests.length > 0 && (
        <div className="mb-2 text-end">
          <button className="btn btn-primary" onClick={exportCSV}>
            Export CSV
          </button>
        </div>
      )}

      <div className="table-responsive">
        <table className="table table-bordered align-middle">
          <thead className="table-light">
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Date Sent</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {localRequests.length > 0 ? (
              localRequests.map((req) => (
                <tr key={req.id}>
                  <td>{req.name}</td>
                  <td>{req.phone}</td>
                  <td>
                    <span
                      className={`badge ${
                        req.status === "Reviewed"
                          ? "bg-success"
                          : "bg-warning text-dark"
                      }`}
                    >
                      {req.status}
                    </span>
                  </td>
                  <td>
                    {new Date(req.created_at)
                      .toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                      .replace(/ /g, "-")}
                  </td>
                  <td>
                    {req.status === "Pending" ? (
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => updateStatus(req.id, "Reviewed")}
                      >
                        Mark Reviewed
                      </button>
                    ) : (
                      <button
                        className="btn btn-sm btn-warning"
                        onClick={() => updateStatus(req.id, "Pending")}
                      >
                        Mark Pending
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">
                  No requests sent yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Analytics;
