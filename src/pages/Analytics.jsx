import React, { useState, useEffect } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { useRealtimeRequests } from "../useRealtimeRequests";
import { supabase } from "../supabaseClient";
import * as XLSX from "xlsx"; // ✅ Added for Excel export
import "./Analytics.css";

const Analytics = () => {
  const user = useUser();
  const requests = useRealtimeRequests(user?.id);
  const [localRequests, setLocalRequests] = useState([]);
  const [showChangeButtons, setShowChangeButtons] = useState(false);

  useEffect(() => {
    setLocalRequests(requests);
  }, [requests]);

  const updateStatus = async (id, newStatus) => {
    setLocalRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );

    const { error } = await supabase
      .from("review_requests")
      .update({ status: newStatus })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error updating status:", error);
      setLocalRequests(requests);
    }
  };

  // ✅ NEW Excel Export function (safe, clean)
  const exportExcel = () => {
    if (!localRequests.length) return;

    const rows = localRequests.map((r) => ({
      Name: r.name,
      Phone: r.phone,
      Status: r.status,
      "Date Sent": new Date(r.created_at).toLocaleDateString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Requests");

    XLSX.writeFile(
      workbook,
      `review_requests_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  if (!user) {
    return (
      <div className="analytics-auth-wrapper">
        <div className="analytics-auth-box">
          <h3>Please sign in to view analytics</h3>
          <button
            className="btn-primary-gradient"
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
    <div className="analytics-page">
      <h1 className="analytics-title">Analytics</h1>

      {localRequests.length > 0 && (
        <div className="analytics-top-buttons">
          <button
            className="btn-secondary-ghost"
            onClick={() => setShowChangeButtons((prev) => !prev)}
          >
            {showChangeButtons ? "Hide Action Buttons" : "Change Status"}
          </button>

          {/* ✅ Updated button to export EXCEL instead of CSV */}
          <button className="btn-primary-gradient" onClick={exportExcel}>
            Export Excel
          </button>
        </div>
      )}

      <div className="analytics-table-wrapper">
        <table className="analytics-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Sent_Date</th>
              {showChangeButtons && <th>Action</th>}
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
                      className={
                        req.status === "Reviewed"
                          ? "status-badge reviewed"
                          : "status-badge pending"
                      }
                    >
                      {req.status}
                    </span>
                  </td>
                  <td>
                    {new Date(req.created_at)
                      .toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "2-digit",
                      })
                      .replace(/ /g, "-")}
                  </td>

                  {showChangeButtons && (
                    <td>
                      {req.status === "Pending" ? (
                        <button
                          className="btn-primary-gradient btn-small"
                          onClick={() => updateStatus(req.id, "Reviewed")}
                        >
                        Reviewed
                        </button>
                      ) : (
                        <button
                          className="btn-secondary-ghost btn-small"
                          onClick={() => updateStatus(req.id, "Pending")}
                        >
                        Pending
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={showChangeButtons ? "5" : "4"}
                  className="analytics-empty"
                >
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
